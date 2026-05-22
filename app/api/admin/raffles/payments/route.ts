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
       PARAMS
    ========================= */

    const { searchParams } =
      new URL(req.url)

    const page =
      Number(
        searchParams.get("page") || 1
      )

    const limit =
      Number(
        searchParams.get("limit") || 20
      )

    const status =
      searchParams.get("status")

    const from =
      (page - 1) * limit

    const to =
      from + limit - 1

    /* =========================
       QUERY
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

        .range(from, to)

    if (status) {

      query =
        query.eq(
          "status",
          status
        )
    }

    const {
      data: payments,
      error,
      count
    } = await query

    if (error) {

      console.error(error)

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

      pagination: {

        page,

        limit,

        total:
          count || 0,

        totalPages:
          Math.ceil(
            (count || 0) / limit
          )
      }

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