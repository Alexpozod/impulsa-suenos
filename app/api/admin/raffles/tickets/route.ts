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
        searchParams.get("limit") || 50
      )

    const status =
      searchParams.get("status")

    const search =
      searchParams.get("search")

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
        .from("ticket_inventory")
        .select(`
          id,
          ticket_code,
          ticket_number,
          status,
          reserved_until,
          buyer_email,
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
          "ticket_number",
          {
            ascending: true
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

    if (search) {

      query =
        query.or(`
          ticket_code.ilike.%${search}%,
          buyer_email.ilike.%${search}%
        `)
    }

    const {
      data: tickets,
      error,
      count
    } = await query

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error: "tickets_error"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      tickets:
        tickets || [],

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