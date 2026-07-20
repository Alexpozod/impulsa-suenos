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
       PARAMS
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

    const raffle_id =
      searchParams.get("raffle_id")

    const from =
      (page - 1) * limit

    const to =
      from + limit - 1

    /* =========================
       GLOBAL STATS
    ========================= */

    let totalPaymentsQuery =
      supabase
        .schema("raffles")
        .from("payments")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )

    let approvedPaymentsQuery =
      supabase
        .schema("raffles")
        .from("payments")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "approved"
        )

    let failedPaymentsQuery =
      supabase
        .schema("raffles")
        .from("payments")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "failed"
        )

    if (raffle_id) {

      totalPaymentsQuery =
        totalPaymentsQuery.eq(
          "raffle_id",
          raffle_id
        )

      approvedPaymentsQuery =
        approvedPaymentsQuery.eq(
          "raffle_id",
          raffle_id
        )

      failedPaymentsQuery =
        failedPaymentsQuery.eq(
          "raffle_id",
          raffle_id
        )
    }

    const [
      totalPaymentsResult,
      approvedPaymentsResult,
      failedPaymentsResult
    ] =
      await Promise.all([
        totalPaymentsQuery,
        approvedPaymentsQuery,
        failedPaymentsQuery
      ])

    if (
      totalPaymentsResult.error ||
      approvedPaymentsResult.error ||
      failedPaymentsResult.error
    ) {

      console.error(
        "payments stats error",
        {
          total:
            totalPaymentsResult.error,

          approved:
            approvedPaymentsResult.error,

          failed:
            failedPaymentsResult.error
        }
      )

      return NextResponse.json(
        {
          error: "payments_stats_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       APPROVED REVENUE
    ========================= */

    const revenueBatchSize =
      1000

    let revenueOffset =
      0

    let approvedRevenue =
      0

    while (true) {

      let revenueQuery =
        supabase
          .schema("raffles")
          .from("payments")
          .select(
            "amount_clp"
          )
          .eq(
            "status",
            "approved"
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
          "payments revenue error",
          revenueError
        )

        return NextResponse.json(
          {
            error: "payments_revenue_error"
          },
          {
            status: 500
          }
        )
      }

      const rows =
        revenueRows || []

      approvedRevenue +=
        rows.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment.amount_clp || 0
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
       PAGINATED PAYMENTS
    ========================= */

    let query =
      supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          raffle_id,
          order_id,
          provider,
          provider_payment_id,
          status,
          amount_clp,
          provider_fee,
          created_at,
          orders (
            buyer_name,
            buyer_email
          ),
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

    if (status) {

      query =
        query.eq(
          "status",
          status
        )
    }

    if (raffle_id) {

      query =
        query.eq(
          "raffle_id",
          raffle_id
        )
    }

    const {
      data: payments,
      error,
      count
    } =
      await query

    if (error) {

      console.error(
        "payments query error",
        error
      )

      return NextResponse.json(
        {
          error: "payments_error"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      payments:
        payments || [],

      stats: {

        totalPayments:
          totalPaymentsResult.count || 0,

        approvedRevenue,

        approvedPayments:
          approvedPaymentsResult.count || 0,

        failedPayments:
          failedPaymentsResult.count || 0
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
      "payments server error",
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