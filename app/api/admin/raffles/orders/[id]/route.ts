import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request,
  {
    params
  }: {
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

    await requireRaffleAdmin({
      user_id: user.id
    })

    const { id } =
      await params

    /* =========================
       ORDER
    ========================= */

    const {
      data: order,
      error: orderError
    } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          *,
          raffles (
            id,
            title,
            slug,
            status,
            ticket_price_clp,
            start_date,
            end_date,
            draw_date
          )
        `)
        .eq(
          "id",
          id
        )
        .single()

    if (
      orderError ||
      !order
    ) {

      return NextResponse.json(
        {
          error: "order_not_found"
        },
        {
          status: 404
        }
      )
    }

    /* =========================
       PAYMENTS
    ========================= */

    const {
      data: payments,
      error: paymentsError
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          provider,
          provider_payment_id,
          status,
          amount_clp,
          amount_usd,
          exchange_rate,
          provider_fee,
          metadata,
          created_at,
          updated_at
        `)
        .eq(
          "order_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    if (paymentsError) {

      console.error(
        "order detail payments error",
        paymentsError
      )

      return NextResponse.json(
        {
          error:
            "order_payments_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       TICKETS
    ========================= */

    const {
      data: tickets,
      error: ticketsError
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          id,
          ticket_code,
          ticket_number,
          status,
          reserved_until,
          buyer_email,
          payment_id,
          metadata,
          created_at,
          updated_at
        `)
        .eq(
          "order_id",
          id
        )
        .order(
          "ticket_number",
          {
            ascending: true
          }
        )

    if (ticketsError) {

      console.error(
        "order detail tickets error",
        ticketsError
      )

      return NextResponse.json(
        {
          error:
            "order_tickets_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       LEDGER
    ========================= */

    const {
      data: ledger,
      error: ledgerError
    } =
      await supabase
        .schema("raffles")
        .from("ledger")
        .select(`
          id,
          payment_id,
          type,
          flow_type,
          amount_clp,
          amount_usd,
          status,
          description,
          metadata,
          created_at
        `)
        .eq(
          "order_id",
          id
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        )

    if (ledgerError) {

      console.error(
        "order detail ledger error",
        ledgerError
      )

      return NextResponse.json(
        {
          error:
            "order_ledger_error"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      order,

      payments:
        payments || [],

      tickets:
        tickets || [],

      ledger:
        ledger || []

    })

  } catch (error) {

    console.error(
      "order detail server error",
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