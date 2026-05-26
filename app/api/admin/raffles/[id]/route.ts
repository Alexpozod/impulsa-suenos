import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {

  try {

    /* =========================
       AUTH
    ========================= */

    const authHeader =
      req.headers.get(
        "authorization"
      )

    const token =
      authHeader?.replace(
        "Bearer ",
        ""
      )

    if (!token) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    const {
      data: { user }
    } =
      await supabase.auth
        .getUser(token)

    if (!user) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    const { id: raffle_id } =
  await context.params

    /* =========================
       RAFFLE
    ========================= */

    const {
      data: raffle
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select("*")
        .eq("id", raffle_id)
        .single()

    /* =========================
       ORDERS
    ========================= */

    const {
      data: orders
    } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select("*")
        .eq("raffle_id", raffle_id)

    /* =========================
       PAYMENTS
    ========================= */

    const {
      data: payments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select("*")
        .eq("raffle_id", raffle_id)

    /* =========================
       TICKETS
    ========================= */

    const {
      data: tickets
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select("*")
        .eq("raffle_id", raffle_id)

/* =========================
   ANALYTICS EVENTS
========================= */

const {
  data: analyticsEvents
} =
  await supabase
    .schema("raffles")
    .from("analytics_events")
    .select("*")
    .eq("raffle_id", raffle_id)

/* =========================
   TRACKING EVENTS
========================= */

const {
  data: trackingEvents
} =
  await supabase
    .schema("raffles")
    .from("tracking_events")
    .select("*")
    .eq("raffle_id", raffle_id)

    /* =========================
       LEDGER
    ========================= */

    const {
      data: ledger
    } =
      await supabase
        .schema("raffles")
        .from("ledger")
        .select("*")
        .eq("raffle_id", raffle_id)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(50)

    /* =========================
       FRAUD
    ========================= */

    const fraudOrders =
      (orders || []).map(order => {

        const flags: string[] = []

        if (
          Number(order.quantity) >= 20
        ) {
          flags.push(
            "high_ticket_volume"
          )
        }

        if (
          !order.ip_address
        ) {
          flags.push(
            "missing_ip"
          )
        }

        return {

          ...order,

          risk_flags: flags,

          risk_level:
            flags.length >= 2
              ? "high"
              : flags.length === 1
              ? "medium"
              : "low"
        }
      })

    /* =========================
       METRICS
    ========================= */

    const revenue =
      (payments || [])
        .filter(
          p =>
            p.status === "approved"
        )
        .reduce(
          (sum, p) =>
            sum +
            Number(
              p.amount_clp || 0
            ),
          0
        )

        /* =========================
   LEDGER BREAKDOWN
========================= */

const grossRevenue =
  (ledger || [])
    .filter(
      l =>
        l.type === "payment"
    )
    .reduce(
      (sum, l) =>
        sum +
        Math.abs(
          Number(
            l.amount_clp || 0
          )
        ),
      0
    )

const providerFees =
  (ledger || [])
    .filter(
      l =>
        l.type === "fee_provider"
    )
    .reduce(
      (sum, l) =>
        sum +
        Math.abs(
          Number(
            l.amount_clp || 0
          )
        ),
      0
    )

const platformFees =
  (ledger || [])
    .filter(
      l =>
        l.type === "platform_fee"
    )
    .reduce(
      (sum, l) =>
        sum +
        Math.abs(
          Number(
            l.amount_clp || 0
          )
        ),
      0
    )

const ivaFees =
  (ledger || [])
    .filter(
      l =>
        l.type === "platform_fee_iva"
    )
    .reduce(
      (sum, l) =>
        sum +
        Math.abs(
          Number(
            l.amount_clp || 0
          )
        ),
      0
    )

const creatorNet =
  (ledger || [])
    .filter(
      l =>
        l.type === "creator_net"
    )
    .reduce(
      (sum, l) =>
        sum +
        Math.abs(
          Number(
            l.amount_clp || 0
          )
        ),
      0
    )

const platformNet =
  platformFees - ivaFees

  /* =========================
   FUNNEL
========================= */

const visits =
  (trackingEvents || [])
    .filter(
      e =>
        e.event_type ===
        "page_view"
    ).length

const beginCheckout =
  (analyticsEvents || [])
    .filter(
      e =>
        e.event_type ===
        "begin_checkout"
    ).length

const paymentSuccess =
  (analyticsEvents || [])
    .filter(
      e =>
        e.event_type ===
        "payment_success"
    ).length

const paymentFailed =
  (analyticsEvents || [])
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

const revenuePerVisit =
  visits > 0
    ? revenue / visits
    : 0

    return NextResponse.json({

      ok: true,

      raffle,

      metrics: {

        revenue,

        grossRevenue,
        providerFees,
        platformFees,
        ivaFees,
        creatorNet,
        platformNet,
        visits,
        beginCheckout,
        paymentSuccess,
        paymentFailed,
        conversionRate,
        revenuePerVisit,

        orders:
          orders?.length || 0,

        payments:
          payments?.length || 0,

        tickets:
          tickets?.length || 0,

        paidTickets:

          tickets?.filter(
            t =>
              t.status === "paid"
          ).length || 0,

        reservedTickets:

          tickets?.filter(
            t =>
              t.status === "reserved"
          ).length || 0,

        availableTickets:

          tickets?.filter(
            t =>
              t.status === "available"
          ).length || 0,

        fraudHigh:

          fraudOrders.filter(
            o =>
              o.risk_level === "high"
          ).length

      },

      orders:
        orders || [],

      payments:
        payments || [],

      tickets:
        tickets || [],

      ledger:
        ledger || [],

      fraud:
        fraudOrders

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