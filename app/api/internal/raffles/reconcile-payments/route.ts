import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { createAuditLog }
from "@/lib/raffles/admin/createAuditLog"

import { checkRateLimit }
from "@/lib/raffles/security/checkRateLimit"

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

if (
  token ===
  process.env
    .RAFFLES_INTERNAL_API_KEY
) {
  authorized = true
}

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
   RATE LIMIT
========================= */

const rateLimit =
  await checkRateLimit({

    key:
      "internal_reconcile_payments",

    route:
      "/api/internal/raffles/reconcile-payments",

    limit: 10,

    windowMinutes: 1

  })

if (!rateLimit.allowed) {

  return NextResponse.json(
    {
      error:
        "rate_limited"
    },
    {
      status: 429
    }
  )

}

    /* =========================
       LOAD PAYMENTS
    ========================= */

    const {
      data: payments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          *,
          orders (*)
        `)
        .eq(
          "status",
          "approved"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(500)

    const issues: any[] = []

    for (const payment of payments || []) {

      /* =========================
         CHECK LEDGER
      ========================= */

      const {
        data: ledger
      } =
        await supabase
          .schema("raffles")
          .from("ledger")
          .select("id")
          .eq(
            "payment_id",
            payment.id
          )
          .limit(1)

      if (
        !ledger ||
        ledger.length === 0
      ) {

        issues.push({

          type:
            "missing_ledger",

          payment_id:
            payment.id,

          order_id:
            payment.order_id
        })
      }

      /* =========================
         CHECK TICKETS
      ========================= */

      const {
        data: tickets
      } =
        await supabase
          .schema("raffles")
          .from("ticket_inventory")
          .select("id")
          .eq(
            "payment_id",
            payment.id
          )
          .eq(
            "status",
            "paid"
          )

      if (
        !tickets ||
        tickets.length === 0
      ) {

        issues.push({

          type:
            "missing_paid_tickets",

          payment_id:
            payment.id,

          order_id:
            payment.order_id
        })
      }

      /* =========================
         CHECK ORDER
      ========================= */

      if (
        payment.orders?.status !==
        "paid"
      ) {

        issues.push({

          type:
            "invalid_order_status",

          payment_id:
            payment.id,

          order_id:
            payment.order_id,

          current_status:
            payment.orders?.status
        })
      }

    }

await createAuditLog({

  action:
    "reconcile_payments",

  entity_type:
    "payments",

  metadata: {

    checked:
  payments?.length || 0,

    issues_found:
      issues.length

  }

})

    return NextResponse.json({

      ok: true,

      checked:
        payments?.length || 0,

      issues_found:
        issues.length,

      issues

    })

  } catch (error) {

    console.error(
      "reconcile-payments error",
      error
    )

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