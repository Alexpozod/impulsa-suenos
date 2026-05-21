import { NextResponse }
from "next/server"

import { z }
from "zod"

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

const schema = z.object({

  raffle_id:
    z.string().uuid()

})

export async function POST(
  req: Request
) {

  try {

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
    "raffle_admin"
  ]
})

    /* =========================================
       BODY
    ========================================= */

    const body =
      await req.json()

    const parsed =
      schema.safeParse(body)

    if (!parsed.success) {

      return NextResponse.json(
        {
          error: "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const {
      raffle_id
    } = parsed.data

    /* =========================================
       LOAD RAFFLE
    ========================================= */

    const { data: raffle } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select(`
          id,
          status
        `)
        .eq("id", raffle_id)
        .maybeSingle()

    if (!raffle) {

      return NextResponse.json(
        {
          error: "raffle_not_found"
        },
        {
          status: 404
        }
      )
    }

    /* =========================================
       VALIDATE STATE
    ========================================= */

    if (
      raffle.status !== "active" &&
      raffle.status !== "paused"
    ) {

      return NextResponse.json(
        {
          error:
            "invalid_raffle_state"
        },
        {
          status: 400
        }
      )
    }

    /* =========================================
       END RAFFLE
    ========================================= */

    await supabase
      .schema("raffles")
      .from("raffles")
      .update({

        status: "ended",

        updated_at:
          new Date().toISOString()

      })
      .eq("id", raffle_id)

    return NextResponse.json({

      ok: true,

      raffle_id,

      status:
        "ended"

    })

  } catch (error) {

    console.error(
      "end raffle error",
      error
    )

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