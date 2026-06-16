import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest
) {

  try {

    const authHeader =
      req.headers.get(
        "authorization"
      )

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
    } =
      await supabase.auth.getUser(
        token
      )

    if (
      userError ||
      !user
    ) {

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

      user_id:
        user.id,

      allowed_roles: [
        "raffle_admin"
      ]

    })

    const body =
      await req.json()

    const raffle_id =
      body.raffle_id

    if (!raffle_id) {

      return NextResponse.json(
        {
          error:
            "raffle_id_required"
        },
        {
          status: 400
        }
      )

    }

    const {
      data: raffle
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select("*")
        .eq("id", raffle_id)
        .maybeSingle()

    if (!raffle) {

      return NextResponse.json(
        {
          error:
            "raffle_not_found"
        },
        {
          status: 404
        }
      )

    }

    if (
      raffle.status !== "paused"
    ) {

      return NextResponse.json(
        {
          error:
            "raffle_not_paused"
        },
        {
          status: 400
        }
      )

    }

    const { error } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .update({

          status: "active"

        })
        .eq(
          "id",
          raffle_id
        )

    if (error) {

      throw error

    }

    return NextResponse.json({

      success: true

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