import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function POST(
  req: Request
) {

  try {

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

    const body =
      await req.json()

    const raffle_id =
      body.raffle_id

    if (!raffle_id) {

      return NextResponse.json(
        {
          error: "missing_raffle_id"
        },
        {
          status: 400
        }
      )
    }

    const {
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .update({

          status:
            "cancelled",

          updated_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          raffle_id
        )

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true

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