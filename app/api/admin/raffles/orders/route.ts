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

    await requireRaffleAdmin({
      user_id: user.id
    })

    /* =========================
       QUERY PARAMS
    ========================= */

    const { searchParams } =
      new URL(req.url)

    const page =
      Math.max(
        Number(
          searchParams.get("page") || 1
        ),
        1
      )

    const limit =
      Math.min(
        Math.max(
          Number(
            searchParams.get("limit") || 20
          ),
          1
        ),
        100
      )

    const status =
      searchParams.get("status")

    const search =
      searchParams.get("search")
        ?.trim()

    const raffle_id =
      searchParams.get("raffle_id")

    const from =
      (page - 1) * limit

    const to =
      from + limit - 1

    /* =========================
       GLOBAL STATS
    ========================= */

    let totalOrdersQuery =
      supabase
        .schema("raffles")
        .from("orders")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )

    let paidOrdersQuery =
      supabase
        .schema("raffles")
        .from("orders")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "paid"
        )

    let pendingOrdersQuery =
      supabase
        .schema("raffles")
        .from("orders")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "pending"
        )

    if (raffle_id) {

      totalOrdersQuery =
        totalOrdersQuery.eq(
          "raffle_id",
          raffle_id
        )

      paidOrdersQuery =
        paidOrdersQuery.eq(
          "raffle_id",
          raffle_id
        )

      pendingOrdersQuery =
        pendingOrdersQuery.eq(
          "raffle_id",
          raffle_id
        )
    }

    const [
      totalOrdersResult,
      paidOrdersResult,
      pendingOrdersResult
    ] =
      await Promise.all([
        totalOrdersQuery,
        paidOrdersQuery,
        pendingOrdersQuery
      ])

    if (
      totalOrdersResult.error ||
      paidOrdersResult.error ||
      pendingOrdersResult.error
    ) {

      console.error(
        "orders stats error",
        {
          total:
            totalOrdersResult.error,

          paid:
            paidOrdersResult.error,

          pending:
            pendingOrdersResult.error
        }
      )

      return NextResponse.json(
        {
          error: "orders_stats_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       CONFIRMED REVENUE
    ========================= */

    const revenueBatchSize =
      1000

    let revenueOffset =
      0

    let confirmedRevenue =
      0

    while (true) {

      let revenueQuery =
        supabase
          .schema("raffles")
          .from("orders")
          .select(
            "total_clp"
          )
          .eq(
            "status",
            "paid"
          )
          .range(
            revenueOffset,
            revenueOffset +
              revenueBatchSize -
              1
          )

      if (raffle_id) {

        revenueQuery =
          revenueQuery.eq(
            "raffle_id",
            raffle_id
          )
      }

      const {
        data: revenueRows,
        error: revenueError
      } =
        await revenueQuery

      if (revenueError) {

        console.error(
          "orders revenue error",
          revenueError
        )

        return NextResponse.json(
          {
            error: "orders_revenue_error"
          },
          {
            status: 500
          }
        )
      }

      const rows =
        revenueRows || []

      confirmedRevenue +=
        rows.reduce(
          (
            sum,
            order
          ) =>
            sum +
            Number(
              order.total_clp || 0
            ),
          0
        )

      if (
        rows.length <
        revenueBatchSize
      ) {
        break
      }

      revenueOffset +=
        revenueBatchSize
    }

    /* =========================
       PAGINATED ORDERS
    ========================= */

    let query =
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
          source,
          created_at,
          raffles (
            title,
            slug
          )
        `,
        {
          count: "exact"
        })
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .range(
          from,
          to
        )

    if (raffle_id) {

      query =
        query.eq(
          "raffle_id",
          raffle_id
        )
    }

    if (status) {

      query =
        query.eq(
          "status",
          status
        )
    }

    if (search) {

      query =
        query.or(
          `buyer_email.ilike.%${search}%,buyer_name.ilike.%${search}%,id.eq.${search}`
        )
    }

    const {
      data: orders,
      error,
      count
    } =
      await query

    if (error) {

      console.error(
        "orders query error",
        error
      )

      return NextResponse.json(
        {
          error: "orders_error"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      orders:
        orders || [],

      stats: {

        totalOrders:
          totalOrdersResult.count || 0,

        confirmedRevenue,

        paidOrders:
          paidOrdersResult.count || 0,

        pendingOrders:
          pendingOrdersResult.count || 0
      },

      pagination: {

        page,

        limit,

        total:
          count || 0,

        totalPages:
          Math.ceil(
            (count || 0) /
            limit
          )
      }

    })

  } catch (error) {

    console.error(
      "orders server error",
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