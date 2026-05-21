import { NextResponse }
from "next/server"

import { z }
from "zod"

import { createClient }
from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

import { createTicketInventory }
from "@/lib/raffles/tickets/createTicketInventory"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

const schema = z.object({

  title:
    z.string().min(3),

  slug:
    z.string().min(3),

  description:
    z.string().min(10),

  cover_image:
    z.string().url(),

  ticket_price:
    z.coerce.number().min(100),

  ticket_prefix:
    z.string().min(2),

  ticket_min_number:
    z.coerce.number(),

  ticket_max_number:
    z.coerce.number(),

  min_tickets_goal:
    z.coerce.number(),

  currency:
    z.string()

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

    const body =
      await req.json()

    const parsed =
      schema.safeParse(body)

    if (!parsed.success) {

      return NextResponse.json(
        {
          error:
            "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const data =
      parsed.data

    /* =========================
       🔒 UNIQUE SLUG
    ========================= */

    const { data: existing } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select("id")
        .eq(
          "slug",
          data.slug
        )
        .maybeSingle()

    if (existing) {

      return NextResponse.json(
        {
          error:
            "slug_exists"
        },
        {
          status: 409
        }
      )
    }

    /* =========================
       🎟️ CREATE RAFFLE
    ========================= */

    const {
  data: raffle,
  error: raffleError
} =
      await supabase
        .schema("raffles")
        .from("raffles")
        .insert({

          title:
            data.title,

          slug:
            data.slug,

          description:
            data.description,

          cover_image:
            data.cover_image,

          ticket_price_clp:
            data.ticket_price,

          ticket_prefix:
            data.ticket_prefix,

          ticket_min_number:
            data.ticket_min_number,

          ticket_max_number:
            data.ticket_max_number,

          min_tickets_goal:
            data.min_tickets_goal,

          currency:
            data.currency,

            created_by:
            user.id,

          status:
            "draft"

        })
        .select()
        .single()

/* =========================================
   INITIAL INVENTORY
========================================= */

if (raffleError || !raffle) {

  console.error(
    raffleError
  )

  return NextResponse.json(
    {
      error: raffleError
    },
    {
      status: 500
    }
  )
}

await createTicketInventory({

  raffle_id:
    raffle.id

})

    return NextResponse.json({

      ok: true,

      raffle

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