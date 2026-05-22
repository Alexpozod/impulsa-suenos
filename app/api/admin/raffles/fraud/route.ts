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

    /* =========================
       LOAD RECENT ORDERS
    ========================= */

    const { data: orders, error } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          id,
          buyer_name,
          buyer_email,
          quantity,
          total_clp,
          status,
          ip_address,
          source,
          user_agent,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(100)

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error: "fraud_load_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       BASIC SIGNALS
    ========================= */

    const suspicious =
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
          !order.ip_address ||
          order.ip_address === "unknown"
        ) {
          flags.push(
            "missing_ip"
          )
        }

        if (
          !order.user_agent ||
          order.user_agent === "unknown"
        ) {
          flags.push(
            "missing_user_agent"
          )
        }

        return {

          ...order,

          risk_flags:
            flags,

          risk_level:

            flags.length >= 2
              ? "high"

            : flags.length === 1
              ? "medium"

            : "low"
        }
      })

    return NextResponse.json({

      ok: true,

      orders:
        suspicious

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