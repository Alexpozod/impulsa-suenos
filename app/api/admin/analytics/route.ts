import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  try {

    /* =========================
       🔥 FUNNEL
    ========================= */

    const { data: events } = await supabase
      .from("campaign_events")
      .select("event_type")

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

    const { data: paymentEvents } = await supabase
      .from("campaign_events")
      .select("user_email")
      .eq("event_type", "payment_success")

    const paidEmails = new Set(
      (paymentEvents || [])
        .map(e => e.user_email)
        .filter(Boolean)
    )

    const abandoned =
      (checkoutEvents || [])
        .filter(event =>
          event.user_email &&
          !paidEmails.has(event.user_email)
        )
        .slice(0, 20)

    /* =========================
       ⚡ REALTIME
    ========================= */

    const { data: realtime } = await supabase
      .from("campaign_events")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(20)

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

      realtime: realtime || []

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