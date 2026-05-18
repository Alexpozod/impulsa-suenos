import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {

  try {

const url = new URL(req.url)

const range =
  url.searchParams.get("range") || "7d"

let fromDate = new Date()

if (range === "24h") {

  fromDate.setDate(fromDate.getDate() - 1)

} else if (range === "7d") {

  fromDate.setDate(fromDate.getDate() - 7)

} else if (range === "30d") {

  fromDate.setDate(fromDate.getDate() - 30)

} else {

  fromDate.setDate(fromDate.getDate() - 7)

}

const fromISOString =
  fromDate.toISOString()

    /* =========================
       🔥 FUNNEL
    ========================= */

    const { data: events } = await supabase
        .from("campaign_events")
        .select("event_type")
        .gte("created_at", fromISOString)

    const allEvents = events || []

    const views =
      allEvents.filter(
        e => e.event_type === "campaign_view"
      ).length

    const donate_clicks =
      allEvents.filter(
        e => e.event_type === "donate_click"
      ).length

    const checkouts =
      allEvents.filter(
        e => e.event_type === "begin_checkout"
      ).length

    const payments =
      allEvents.filter(
        e => e.event_type === "payment_success"
      ).length

    const conversion =
      views > 0
        ? Number(
            ((payments / views) * 100).toFixed(2)
          )
        : 0

/* =========================
   💰 REVENUE GLOBAL
========================= */

const { data: paymentSuccessEvents } = await supabase
  .from("campaign_events")
  .select(`
    metadata,
    created_at
  `)
  .eq("event_type", "payment_success")

const successfulPayments =
  paymentSuccessEvents || []

const revenueTotal =
  successfulPayments.reduce(
    (acc, event) =>
      acc +
      Number(event.metadata?.amount || 0),
    0
  )

const paymentsToday =
  successfulPayments.filter(event => {

    const eventDate =
      new Date(event.created_at)
        .toISOString()
        .slice(0, 10)

    const today =
      new Date()
        .toISOString()
        .slice(0, 10)

    return eventDate === today

  })

const revenueToday =
  paymentsToday.reduce(
    (acc, event) =>
      acc +
      Number(event.metadata?.amount || 0),
    0
  )

const averageTicket =
  payments > 0
    ? Number(
        (revenueTotal / payments)
          .toFixed(0)
      )
    : 0

/* =========================
   📈 REVENUE DIARIO
========================= */

const revenueByDayMap: Record<string, number> = {}

successfulPayments.forEach(event => {

  const day =
    new Date(event.created_at)
      .toISOString()
      .slice(0, 10)

  if (!revenueByDayMap[day]) {
    revenueByDayMap[day] = 0
  }

  revenueByDayMap[day] +=
    Number(event.metadata?.amount || 0)

})

const revenueChart =
  Object.entries(revenueByDayMap)
    .map(([date, revenue]) => ({
      date,
      revenue
    }))
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    .slice(-14)

    /* =========================
       🏆 TOP CAMPAÑAS
    ========================= */

    const { data: campaignEvents } = await supabase
  .from("campaign_events")
  .select(`
    campaign_id,
    event_type
  `)
  .gte("created_at", fromISOString)

    const campaignsMap: Record<string, any> = {}

    ;(campaignEvents || []).forEach(event => {

      if (!event.campaign_id) return

      if (!campaignsMap[event.campaign_id]) {
        campaignsMap[event.campaign_id] = {
          campaign_id: event.campaign_id,
          views: 0,
          payments: 0
        }
      }

      if (event.event_type === "campaign_view") {
        campaignsMap[event.campaign_id].views += 1
      }

      if (event.event_type === "payment_success") {
        campaignsMap[event.campaign_id].payments += 1
      }
    })

    const topCampaignsRaw =
  Object.values(campaignsMap)
    .sort((a: any, b: any) => b.payments - a.payments)
    .slice(0, 10)

/* =========================
   🔥 ENRIQUECER CAMPAÑAS
========================= */

const campaignIds = topCampaignsRaw.map(
  (c: any) => c.campaign_id
)

const { data: campaignsData } = await supabase
  .from("campaigns")
  .select(`
    id,
    title,
    user_email,
    current_amount
  `)
  .in("id", campaignIds)

const campaignsInfoMap: Record<string, any> = {}

;(campaignsData || []).forEach(campaign => {

  campaignsInfoMap[campaign.id] = campaign

})

const topCampaigns = topCampaignsRaw.map(
  (campaign: any) => {

    const info =
      campaignsInfoMap[campaign.campaign_id]

    const views = Number(campaign.views || 0)

    const payments = Number(campaign.payments || 0)

    const conversion =
      views > 0
        ? Number(
            ((payments / views) * 100).toFixed(2)
          )
        : 0

    return {

      ...campaign,

      title:
        info?.title ||
        "Campaña",

      organizer:
        info?.user_email
          ?.split("@")[0]
          ?.replace(/[0-9]/g, "")
          ?.replace(/[._-]/g, " ")
          ?.trim() ||
        "Usuario",

      revenue:
        Number(info?.current_amount || 0),

      conversion
    }
  }
)

    /* =========================
       🌍 TOP SOURCES
    ========================= */

    const { data: sourceEvents } = await supabase
  .from("campaign_events")
  .select(`
    source,
    event_type,
    metadata
  `)
  .gte("created_at", fromISOString)

    const sourcesMap: Record<string, any> = {}

    ;(sourceEvents || []).forEach(event => {

      if (!event.source) return

      if (!sourcesMap[event.source]) {
        sourcesMap[event.source] = {
          source: event.source,
          payments: 0,
          revenue: 0
        }
      }

      if (event.event_type === "payment_success") {

        sourcesMap[event.source].payments += 1

        sourcesMap[event.source].revenue +=
          Number(event.metadata?.amount || 0)
      }
    })

    const topSources =
      Object.values(sourcesMap)
        .sort((a: any, b: any) => b.revenue - a.revenue)

    /* =========================
       ⚠️ ABANDONADOS
    ========================= */

    const { data: checkoutEvents } = await supabase
  .from("campaign_events")
  .select("*")
  .eq("event_type", "begin_checkout")
  .gte("created_at", fromISOString)

    const { data: paymentEvents } = await supabase
  .from("campaign_events")
  .select(`
    session_id,
    created_at
  `)
  .eq("event_type", "payment_success")
  .gte("created_at", fromISOString)

const paidSessions = new Set(
  (paymentEvents || [])
    .map(e => e.session_id)
    .filter(Boolean)
)

const abandoned =
  (checkoutEvents || [])
    .filter(event => {

      if (!event.session_id) return false

      if (paidSessions.has(event.session_id)) {
        return false
      }

      const created =
        new Date(event.created_at).getTime()

      const now = Date.now()

      const minutes =
        (now - created) / 1000 / 60

      // mínimo 15 min abandono real
      return minutes >= 15
    })
    .map((event: any) => {

      const created =
        new Date(event.created_at).getTime()

      const now = Date.now()

      const minutesAgo =
        Math.floor(
          (now - created) / 1000 / 60
        )

      return {

        ...event,

        abandoned_minutes:
          minutesAgo
      }
    })
    .sort((a: any, b: any) =>
      b.abandoned_minutes -
      a.abandoned_minutes
    )
    .slice(0, 20)

    /* =========================
       ⚡ REALTIME
    ========================= */

    const { data: realtime } = await supabase
  .from("campaign_events")
  .select("*")
  .gte("created_at", fromISOString)
  .order("created_at", {
    ascending: false
  })
  .limit(20)

    /* =========================
   💎 TOP DONADORES
========================= */

const { data: topDonorsRaw } = await supabase
  .from("payments")
  .select(`
    donor_email,
    amount,
    donor_name,
    created_at
  `)
  .eq("status", "approved")
  .gte("created_at", fromISOString)

const donorsMap: Record<string, any> = {}

;(topDonorsRaw || []).forEach((payment: any) => {

  const email =
    payment.donor_email ||
    "unknown"

  if (!donorsMap[email]) {

    donorsMap[email] = {
      donor_email: email,
      donor_name:
        payment.donor_name ||
        email.split("@")[0],
      total: 0,
      payments: 0
    }
  }

  donorsMap[email].total +=
    Number(payment.amount || 0)

  donorsMap[email].payments += 1
})

const topDonors =
  Object.values(donorsMap)
    .map((donor: any) => ({
      ...donor,

      average_ticket:
        donor.payments > 0
          ? Math.round(
              donor.total /
              donor.payments
            )
          : 0
    }))
    .sort((a: any, b: any) =>
      b.total - a.total
    )
    .slice(0, 10)

/* =========================
   💸 REVENUE PERDIDO
========================= */

const lostRevenue =
  abandoned.reduce(
    (acc: number, item: any) =>
      acc +
      Number(item.metadata?.amount || 0),
    0
  )

/* =========================
   🌍 SOURCE CONVERSION
========================= */

const sourceStatsMap: Record<string, any> = {}

;(sourceEvents || []).forEach((event: any) => {

  const source =
    event.source || "direct"

  if (!sourceStatsMap[source]) {

    sourceStatsMap[source] = {
      source,
      views: 0,
      payments: 0
    }
  }

  if (event.event_type === "campaign_view") {
    sourceStatsMap[source].views += 1
  }

  if (event.event_type === "payment_success") {
    sourceStatsMap[source].payments += 1
  }

})

const sourceConversions =
  Object.values(sourceStatsMap)
    .map((source: any) => {

      const conversion =
        source.views > 0
          ? Number(
              (
                (source.payments / source.views) * 100
              ).toFixed(2)
            )
          : 0

      return {
        ...source,
        conversion
      }
    })
    .sort((a: any, b: any) =>
      b.conversion - a.conversion
    )

/* =========================
   🔥 HEATMAP
========================= */

const heatmapMap: Record<string, number> = {}

successfulPayments.forEach((payment: any) => {

  const date =
    new Date(payment.created_at)

  const hour =
    date.getHours()

  if (!heatmapMap[hour]) {
    heatmapMap[hour] = 0
  }

  heatmapMap[hour] +=
    Number(payment.metadata?.amount || 0)

})

const heatmap =
  Object.entries(heatmapMap)
    .map(([hour, revenue]) => ({
      hour,
      revenue
    }))
    .sort((a: any, b: any) =>
      Number(a.hour) - Number(b.hour)
    )

/* =========================
   👥 COHORTS
========================= */

const recurrentDonors =
  topDonors.filter(
    (donor: any) =>
      donor.payments >= 2
  ).length

const whales =
  topDonors.filter(
    (donor: any) =>
      donor.total >= 50000
  ).length

const retentionRate =
  topDonors.length > 0
    ? Number(
        (
          (recurrentDonors / topDonors.length) * 100
        ).toFixed(2)
      )
    : 0

/* =========================
   🔥 INSIGHTS
========================= */

const insights: string[] = []

/* =========================
   🔥 CONVERSIÓN ALTA
========================= */

if (conversion >= 15) {

  insights.push(
    `🔥 Conversión muy alta (${conversion}%)`
  )
}

/* =========================
   💰 REVENUE FUERTE
========================= */

const revenueTodayValue =
  Number(revenueToday || 0)

if (revenueTodayValue >= 100000) {

  insights.push(
    `💰 Revenue hoy supera $${revenueTodayValue.toLocaleString()}`
  )
}

/* =========================
   ⚠️ MUCHOS ABANDONOS
========================= */

if ((abandoned?.length || 0) >= 5) {

  insights.push(
    `⚠️ Hay ${abandoned.length} checkouts abandonados`
  )
}

/* =========================
   🚀 TOP SOURCE
========================= */

const bestSource =
  topSources?.[0]

if (
  bestSource &&
  bestSource.revenue > 0
) {

  insights.push(
    `🚀 ${bestSource.source} lidera con $${Number(
      bestSource.revenue
    ).toLocaleString()}`
  )
}

/* =========================
   💎 WHALE
========================= */

const topDonor =
  topDonors?.[0]

if (
  topDonor &&
  topDonor.total >= 50000
) {

  insights.push(
    `💎 Whale detectado: ${topDonor.donor_name}`
  )
}

    return NextResponse.json({

        revenue: {
            total: revenueTotal,
            today: revenueToday,
            average_ticket: averageTicket
            },

               revenueChart, 

      funnel: {
        views,
        donate_clicks,
        checkouts,
        payments,
        conversion
      },

      topCampaigns,

      topSources,

      abandoned,

      realtime: realtime || [],

        topDonors,

        insights,

        lostRevenue,

        sourceConversions,

        heatmap,

        cohorts: {
        recurrentDonors,
        whales,
        retentionRate
        }

    })

  } catch (err) {

    console.error("admin analytics error:", err)

    return NextResponse.json(
      {
        error: "internal_error"
      },
      {
        status: 500
      }
    )
  }
}