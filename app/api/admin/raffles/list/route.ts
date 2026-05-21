import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // =========================
    // QUERY PARAMS
    // =========================
/* =========================================
   RAFFLE ADMIN AUTH
========================================= */

const authHeader =
  req.headers.get("authorization")

if (!authHeader) {

  return NextResponse.json(
    {
      error: "unauthorized"
    },
    {
      status: 401
    }
  )
}

const token =
  authHeader.replace(
    "Bearer ",
    ""
  )

const {
  data: { user },
  error: userError
} = await supabase.auth.getUser(
  token
)

if (userError || !user) {

  return NextResponse.json(
    {
      error: "invalid_user"
    },
    {
      status: 401
    }
  )
}

await requireRaffleAdmin({

  user_id: user.id,

  allowed_roles: [
    "raffle_admin",
    "raffle_operator",
    "raffle_accountant"
  ]
})

    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const from = (page - 1) * limit
    const to = from + limit - 1

    // =========================
    // BASE QUERY
    // =========================

    let query = supabase
      .schema("raffles")
      .from("raffles")
      .select("*", { count: "exact" })

    // =========================
    // FILTER STATUS
    // =========================

    if (status) {
      query = query.eq("status", status)
    }

    // =========================
    // SEARCH
    // =========================

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,slug.ilike.%${search}%`
      )
    }

    // =========================
    // PAGINATION
    // =========================

    query = query
      .order("created_at", { ascending: false })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("raffles list error FULL =>", JSON.stringify(error, null, 2))

      return NextResponse.json(
        {
          error: "Error loading raffles"
        },
        { status: 500 }
      )
    }

    // =========================
    // EMPTY
    // =========================

    if (!data || data.length === 0) {
      return NextResponse.json({
        raffles: [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: 0
        }
      })
    }

    // =========================
    // IDS
    // =========================

    const raffleIds = data.map((r) => r.id)

    // =========================
    // PAYMENTS
    // =========================

    const { data: payments } = await supabase
  .schema("raffles")
  .from("payments")
  .select(`
    raffle_id,
    amount_clp,
    status
  `)
  .in("raffle_id", raffleIds)
  .eq("status", "approved")

    // =========================
    // TICKETS
    // =========================

    const { data: tickets } = await supabase
  .schema("raffles")
  .from("ticket_inventory")
  .select(`
    raffle_id,
    status
  `)
  .in("raffle_id", raffleIds)
  .eq("status", "paid")

    // =========================
    // ORDERS
    // =========================

    const { data: orders } = await supabase
      .schema("raffles")
      .from("orders")
      .select(`
        raffle_id
      `)
      .in("raffle_id", raffleIds)

    // =========================
    // BUILD RESPONSE
    // =========================

    const raffles = data.map((raffle) => {
      const rafflePayments =
        payments?.filter(
          (p) => p.raffle_id === raffle.id
        ) || []

      const raffleTickets =
        tickets?.filter(
          (t) => t.raffle_id === raffle.id
        ) || []

      const raffleOrders =
        orders?.filter(
          (o) => o.raffle_id === raffle.id
        ) || []

      const revenue = rafflePayments.reduce(
        (sum, payment) =>
          sum + Number(payment.amount_clp || 0),
        0
      )

      return {
        ...raffle,

        revenue,

        tickets_sold: raffleTickets.length,

        total_orders: raffleOrders.length
      }
    })

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      raffles,

      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error("raffles admin list fatal FULL =>", error)

    return NextResponse.json(
      {
        error: "Internal server error"
      },
      { status: 500 }
    )
  }
}