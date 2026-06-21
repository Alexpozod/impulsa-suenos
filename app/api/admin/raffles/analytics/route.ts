import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request
) {

  try {

/* =========================
   AUTH
========================= */

const auth =
  await requireAdminAccess(
    req
  )

if (!auth.authorized) {

  return NextResponse.json(
    {
      error:
        "unauthorized"
    },
    {
      status: 401
    }
  )

}

    /* =========================
       💰 PAGOS APROBADOS
    ========================= */

    const { data: payments } =
  await supabase
    .schema("raffles")
    .from("payments")
    .select(`
      *,
      raffles (
        id,
        title
      )
    `)
    .eq("status", "approved")

    /* =========================
       🎟️ TICKETS
    ========================= */

    const { data: tickets } =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select(`
      id,
      status,
      raffle_id
    `)

    console.log(
  "TICKET SAMPLE",
  tickets?.slice(0, 20)
)

const raffleBreakdown =
  (tickets || []).reduce(
    (acc: any, t: any) => {

      if (!acc[t.raffle_id]) {

        acc[t.raffle_id] = {
          paid: 0,
          winner: 0,
          available: 0
        }

      }

      acc[t.raffle_id][t.status] =
        (acc[t.raffle_id][t.status] || 0) + 1

      return acc

    },
    {}
  )

console.log(
  "RAFFLE BREAKDOWN",
  raffleBreakdown
)

    /* =========================
       🎯 EVENTS
    ========================= */

    const { data: events } =
      await supabase
        .schema("raffles")
        .from("analytics_events")
        .select("*")
    
    const totalRevenue =
      (payments || [])
        .reduce(
          (acc, p) =>
            acc + Number(p.amount_clp || 0),
          0
        )

    const totalPayments =
      (payments || []).length

    const totalTickets =
  (tickets || [])
    .filter(
      t =>
        t.status === "paid" ||
        t.status === "winner"
    )
    .length

    console.log(
  "TICKET STATS",
  (tickets || []).reduce(
    (acc: any, t: any) => {
      acc[t.status] =
        (acc[t.status] || 0) + 1
      return acc
    },
    {}
  )
)

      const totalVisits =
(events || [])
.filter(
  e =>
    e.event_type ===
    "page_view"
).length

    const beginCheckout =
      (events || [])
        .filter(
          e =>
            e.event_type ===
            "begin_checkout"
        ).length

    const paymentSuccess =
      (events || [])
        .filter(
          e =>
            e.event_type ===
            "payment_success"
        ).length

    const paymentFailed =
      (events || [])
        .filter(
          e =>
            e.event_type ===
            "payment_failed"
        ).length

    const conversionRate =
      beginCheckout > 0
        ? (
            paymentSuccess /
            beginCheckout
          ) * 100
        : 0

const avgOrderValue =
  totalPayments > 0
    ? totalRevenue /
      totalPayments
    : 0

const revenuePerVisit =
  totalVisits > 0
    ? totalRevenue /
      totalVisits
    : 0

    /* =========================
       📊 SOURCE BREAKDOWN
    ========================= */

    const topRaffles: any = {}

    const dailyRevenue: any = {}
    
    const sources: any = {}

    const campaigns: any = {}

    const raffleTitles: Record<
  string,
  string
> = {}

for (
  const payment of payments || []
) {

  if (
    payment.raffle_id &&
    payment.raffles?.title
  ) {

    raffleTitles[
      payment.raffle_id
    ] =
      payment.raffles.title

  }

}

    for (const event of events || []) {

      if (
        event.event_type !==
        "payment_success"
      ) continue

      const source =
        event.source || "direct"

      if (!sources[source]) {

        sources[source] = {

          revenue: 0,

          conversions: 0

        }
      }

      sources[source].revenue +=
        Number(
          event.metadata?.amount || 0
        )

      sources[source].conversions += 1

      const campaign =
  event.utm_campaign ||
  "organic"

if (!campaigns[campaign]) {

  campaigns[campaign] = {

    revenue: 0,

    conversions: 0
  }
}

campaigns[campaign].revenue +=
  Number(
    event.metadata?.amount || 0
  )

campaigns[campaign].conversions += 1

const raffleId =
  event.raffle_id || "unknown"

const raffleTitle =
  raffleTitles[
    raffleId
  ] ||
  "Sin título"

if (!topRaffles[raffleId]) {

  topRaffles[raffleId] = {

    title:
      raffleTitle,

    revenue: 0,

    conversions: 0
  }
}

topRaffles[raffleId].revenue +=
  Number(
    event.metadata?.amount || 0
  )

topRaffles[raffleId].conversions += 1

const day =
  new Date(
    event.created_at
  )
    .toISOString()
    .split("T")[0]

if (!dailyRevenue[day]) {

  dailyRevenue[day] = 0
}

dailyRevenue[day] +=
  Number(
    event.metadata?.amount || 0
  )

    }

    return NextResponse.json({

      revenue:
        totalRevenue,

      payments:
        totalPayments,

      tickets:
        totalTickets,

      beginCheckout,

      paymentSuccess,

      paymentFailed,

      conversionRate,

      visits:
  totalVisits,

avgOrderValue,

revenuePerVisit,

      topRaffles,

        dailyRevenue,

        sources,

        campaigns

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )
  }
}