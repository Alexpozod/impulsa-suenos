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
       QUERY PARAMS
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

    const search =
    searchParams.get("search")

    const raffle_id =
    searchParams.get("raffle_id")

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

        .range(from, to)

    if (raffle_id) {

        query =
            query.eq(
            "raffle_id",
            raffle_id
            )
        }

    if (search) {

      query =
        query.or(`
          buyer_email.ilike.%${search}%,
          buyer_name.ilike.%${search}%
        `)
    }

    const {
      data: orders,
      error,
      count
    } = await query

    if (error) {

      console.error(error)

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