import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request
) {

  try {

    const auth =
      await requireAdminAccess(
        req
      )

    if (!auth.authorized) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    const { searchParams } =
      new URL(req.url)

    const raffle_id =
      searchParams.get(
        "raffle_id"
      )

    let query =
      supabase
        .schema("raffles")
        .from("fraud_logs")
        .select(`
          *,
          orders (
            buyer_name,
            buyer_email,
            total_clp,
            source
          )
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(200)

    if (raffle_id) {

      query =
        query.eq(
          "raffle_id",
          raffle_id
        )
    }

    const {
      data,
      error
    } = await query

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error:
            "fraud_load_error"
        },
        {
          status: 500
        }
      )
    }

    const incidents =
      (data || []).map(
        incident => ({

          ...incident,

          buyer_name:
            incident.orders
              ?.buyer_name ||

            "-",


          buyer_email:
            incident.orders
              ?.buyer_email ||

            incident.user_email ||

            "-",


          total_clp:
            incident.orders
              ?.total_clp ||

            0,


          source:
            incident.orders
              ?.source ||

            "-"
        })
      )

    return NextResponse.json({

      ok: true,

      orders:
        incidents

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error:
          "server_error"
      },
      {
        status: 500
      }
    )
  }
}