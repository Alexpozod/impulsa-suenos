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
    
const { searchParams } =
  new URL(req.url)

const raffle_id =
  searchParams.get("raffle_id")

    /* =========================
       LOAD RECENT ORDERS
    ========================= */

    let fraudQuery =
  supabase
        .schema("raffles")
        .from("orders")
.select(`
  id,
  raffle_id,
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

if (raffle_id) {

  fraudQuery =
    fraudQuery.eq(
      "raffle_id",
      raffle_id
    )
}

const {
  data: orders,
  error
} = await fraudQuery

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