import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET() {

  try {

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
        .from("tickets")
        .select("*")

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
            acc + Number(p.amount || 0),
          0
        )

    const totalPayments =
      (payments || []).length

    const totalTickets =
      (tickets || []).length

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

    /* =========================
       📊 SOURCE BREAKDOWN
    ========================= */

    const topRaffles: any = {}

    const dailyRevenue: any = {}
    
    const sources: any = {}

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

const raffleId =
  event.raffle_id || "unknown"

const rafflePayment =
  payments?.find(
    p =>
      p.raffle_id === raffleId
  )

const raffleTitle =
  rafflePayment?.raffles?.title ||
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

      topRaffles,

        dailyRevenue,

        sources

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