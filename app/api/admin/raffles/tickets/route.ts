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
            searchParams.get("limit") || 50
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

    let totalTicketsQuery =
      supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )

    let availableTicketsQuery =
      supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "available"
        )

    let reservedTicketsQuery =
      supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .eq(
          "status",
          "reserved"
        )

    let paidTicketsQuery =
      supabase
        .schema("raffles")
        .from("ticket_inventory")
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

    if (raffle_id) {

      totalTicketsQuery =
        totalTicketsQuery.eq(
          "raffle_id",
          raffle_id
        )

      availableTicketsQuery =
        availableTicketsQuery.eq(
          "raffle_id",
          raffle_id
        )

      reservedTicketsQuery =
        reservedTicketsQuery.eq(
          "raffle_id",
          raffle_id
        )

      paidTicketsQuery =
        paidTicketsQuery.eq(
          "raffle_id",
          raffle_id
        )
    }

    const [
      totalTicketsResult,
      availableTicketsResult,
      reservedTicketsResult,
      paidTicketsResult
    ] =
      await Promise.all([
        totalTicketsQuery,
        availableTicketsQuery,
        reservedTicketsQuery,
        paidTicketsQuery
      ])

    if (
      totalTicketsResult.error ||
      availableTicketsResult.error ||
      reservedTicketsResult.error ||
      paidTicketsResult.error
    ) {

      console.error(
        "tickets stats error",
        {
          total:
            totalTicketsResult.error,

          available:
            availableTicketsResult.error,

          reserved:
            reservedTicketsResult.error,

          paid:
            paidTicketsResult.error
        }
      )

      return NextResponse.json(
        {
          error: "tickets_stats_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       PAGINATED TICKETS
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

    if (search) {

      query =
        query.or(
          `ticket_code.ilike.%${search}%,buyer_email.ilike.%${search}%`
        )
    }

    const {
      data: tickets,
      error,
      count
    } =
      await query

    if (error) {

      console.error(
        "tickets query error",
        error
      )

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

      stats: {

        totalTickets:
          totalTicketsResult.count || 0,

        availableTickets:
          availableTicketsResult.count || 0,

        reservedTickets:
          reservedTicketsResult.count || 0,

        paidTickets:
          paidTicketsResult.count || 0
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
      "tickets server error",
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