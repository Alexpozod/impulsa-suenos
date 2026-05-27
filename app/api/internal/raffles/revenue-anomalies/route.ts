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

export async function GET(
  req: Request
) {

  try {

    /* =========================
       INTERNAL AUTH
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

let authorized = false

/* =========================
   INTERNAL API KEY
========================= */

if (
  token ===
  process.env
    .RAFFLES_INTERNAL_API_KEY
) {

  authorized = true
}

/* =========================
   ADMIN JWT
========================= */

if (
  token &&
  !authorized
) {

  const {
    data: { user }
  } =
    await supabase.auth
      .getUser(token)

  if (user) {

    const {
      data: adminUser
    } =
      await supabase
        .schema("raffles")
        .from("admin_users")
        .select("id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "active",
          true
        )
        .maybeSingle()

    if (adminUser) {

      authorized = true

    }

  }

}

if (!authorized) {

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
       LAST 24 HOURS
    ========================= */

    const since =
      new Date(
        Date.now() -
        24 * 60 * 60 * 1000
      ).toISOString()

    const {
      data: events
    } =
      await supabase
        .schema("raffles")
        .from("analytics_events")
        .select(`
          id,
          raffle_id,
          event_type,
          metadata,
          created_at
        `)
        .gte(
          "created_at",
          since
        )

    const anomalies: any[] = []

    const grouped =
      new Map()

    for (
      const event of
      events || []
    ) {

      if (
        !grouped.has(
          event.raffle_id
        )
      ) {

        grouped.set(
          event.raffle_id,
          []
        )

      }

      grouped
        .get(event.raffle_id)
        .push(event)

    }

    for (
      const [
        raffle_id,
        raffleEvents
      ] of grouped
    ) {

      const beginCheckout =
        raffleEvents.filter(
          (e: any) =>
            e.event_type ===
            "begin_checkout"
        ).length

      const paymentSuccess =
        raffleEvents.filter(
          (e: any) =>
            e.event_type ===
            "payment_success"
        ).length

      const paymentFailed =
        raffleEvents.filter(
          (e: any) =>
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

      const revenue =
        raffleEvents
          .filter(
            (e: any) =>
              e.event_type ===
              "payment_success"
          )
          .reduce(
            (
              sum: number,
              e: any
            ) =>

              sum +
              Number(
                e.metadata?.amount || 0
              ),

            0
          )

      /* =========================
         LOW CONVERSION
      ========================= */

      if (
        beginCheckout >= 10 &&
        conversionRate < 20
      ) {

        anomalies.push({

          type:
            "low_conversion_rate",

          severity:
            "high",

          raffle_id,

          conversion_rate:
            Number(
              conversionRate.toFixed(2)
            ),

          begin_checkout:
            beginCheckout,

          payment_success:
            paymentSuccess

        })

      }

      /* =========================
         HIGH FAILED PAYMENTS
      ========================= */

      if (
        paymentFailed >= 5
      ) {

        anomalies.push({

          type:
            "high_failed_payments",

          severity:
            "high",

          raffle_id,

          payment_failed:
            paymentFailed

        })

      }

      /* =========================
         ZERO REVENUE
      ========================= */

      if (
        beginCheckout >= 10 &&
        revenue <= 0
      ) {

        anomalies.push({

          type:
            "zero_revenue",

          severity:
            "critical",

          raffle_id

        })

      }

    }

    return NextResponse.json({

      ok: true,

      anomalies_found:
        anomalies.length,

      anomalies

    })

  } catch (error) {

    console.error(
      "revenue anomalies error",
      error
    )

    return NextResponse.json(
      {
        error:
          "server_error"
      },
      {
        status: 500
      }
    )
  }
}