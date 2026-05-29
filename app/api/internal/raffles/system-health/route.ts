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

const issues: any[] = []


    /* =========================
       STUCK PAYMENTS
    ========================= */

    const stuckDate =
      new Date(
        Date.now() -
        15 * 60 * 1000
      ).toISOString()

    const {
      data: stuckPayments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          order_id,
          raffle_id,
          status,
          created_at
        `)
        .eq(
          "status",
          "processing"
        )
        .lte(
          "created_at",
          stuckDate
        )

    for (
      const payment of
      stuckPayments || []
    ) {

      issues.push({

        type:
          "stuck_payment",

        severity:
          "high",

        payment_id:
          payment.id,

        order_id:
          payment.order_id,

        raffle_id:
          payment.raffle_id,

        created_at:
          payment.created_at

      })

    }

    /* =========================
       OLD PENDING ORDERS
    ========================= */

    const pendingDate =
      new Date(
        Date.now() -
        30 * 60 * 1000
      ).toISOString()

    const {
      data: oldPendingOrders
    } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          id,
          raffle_id,
          buyer_email,
          created_at
        `)
        .eq(
          "status",
          "pending"
        )
        .lte(
          "created_at",
          pendingDate
        )

    for (
      const order of
      oldPendingOrders || []
    ) {

      issues.push({

        type:
          "old_pending_order",

        severity:
          "medium",

        order_id:
          order.id,

        raffle_id:
          order.raffle_id,

        buyer_email:
          order.buyer_email,

        created_at:
          order.created_at

      })

    }

    /* =========================
       RESERVED TICKETS TOO OLD
    ========================= */

    const {
      data: oldReservations
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          id,
          raffle_id,
          order_id,
          reserved_until
        `)
        .eq(
          "status",
          "reserved"
        )
        .lte(
          "reserved_until",
          new Date().toISOString()
        )

    for (
      const ticket of
      oldReservations || []
    ) {

      issues.push({

        type:
          "expired_reserved_ticket",

        severity:
          "medium",

        ticket_id:
          ticket.id,

        raffle_id:
          ticket.raffle_id,

        order_id:
          ticket.order_id

      })

    }

    /* =========================
       APPROVED PAYMENTS
       WITHOUT LEDGER
    ========================= */

    const {
      data: approvedPayments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          raffle_id,
          order_id
        `)
        .eq(
          "status",
          "approved"
        )

const {
  data: ledgerEntries
}
=
await supabase
  .schema("raffles")
  .from("ledger")
  .select(`
    payment_id
  `)

const ledgerPaymentIds =
  new Set(

    (ledgerEntries || [])
      .map(
        entry =>
          entry.payment_id
      )

  )

    for (
  const payment of
  approvedPayments || []
) {

  if (
    !ledgerPaymentIds.has(
      payment.id
    )
  ) {

    issues.push({

      type:
        "missing_ledger",

      severity:
        "high",

      payment_id:
        payment.id,

      raffle_id:
        payment.raffle_id,

      order_id:
        payment.order_id

    })

  }

}

/* =========================
   PAID TICKETS WITH
   FAILED PAYMENTS
========================= */

const {
  data: invalidPaidTickets
} =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select(`
      id,
      ticket_code,
      raffle_id,
      order_id,
      payment_id
    `)
    .eq(
      "status",
      "paid"
    )

if (
  invalidPaidTickets &&
  invalidPaidTickets.length > 0
) {

  const paymentIds =
    invalidPaidTickets
      .map(
        ticket =>
          ticket.payment_id
      )
      .filter(Boolean)

  if (paymentIds.length > 0) {

    const {
      data: payments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          status
        `)
        .in(
          "id",
          paymentIds
        )

    const paymentMap =
      new Map(
        (payments || [])
          .map(
            payment => [
              payment.id,
              payment.status
            ]
          )
      )

    for (
      const ticket of
      invalidPaidTickets
    ) {

      const paymentStatus =
        paymentMap.get(
          ticket.payment_id
        )

      if (
        paymentStatus &&
        paymentStatus !==
          "approved"
      ) {

        issues.push({

          type:
            "paid_ticket_with_failed_payment",

          severity:
            "high",

          ticket_id:
            ticket.id,

          ticket_code:
            ticket.ticket_code,

          raffle_id:
            ticket.raffle_id,

          order_id:
            ticket.order_id,

          payment_id:
            ticket.payment_id,

          payment_status:
            paymentStatus

        })

      }

    }

  }

}

    return NextResponse.json({

      ok: true,

      issues_found:
        issues.length,

      issues

    })

  } catch (error) {

    console.error(
      "system health error",
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