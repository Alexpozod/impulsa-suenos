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

  prize_title:
    z.string().min(3),

  prize_description:
    z.string().optional(),

  cover_image:
    z.string().url(),

  gallery:
    z.array(
      z.string().url()
    ).optional(),

  promo_video:
  z.union([
    z.string().url(),
    z.literal("")
  ])
  .optional(),

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
    z.string(),

  start_date:
    z.string().optional(),

  end_date:
    z.string().optional(),

  draw_date:
    z.string().optional(),

    legal_terms:
    z.string().optional(),

  rules:
    z.string().optional(),

    legal_document_url:
  z.string().optional(),

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

  console.log(
    parsed.error.flatten()
  )

  return NextResponse.json(
    {
      error: "invalid_input",
      details:
        parsed.error.flatten()
    },
    {
      status: 400
    }
  )
}

    const data =
      parsed.data

      console.log(
  "RAFFLE CREATE DATA",
  JSON.stringify(
    data,
    null,
    2
  )
)

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
  data: insertedRaffle,
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

          prize_title:
            data.prize_title,

          prize_description:
            data.prize_description,

          cover_image:
            data.cover_image,

gallery:
  data.gallery || [],

promo_video:
  data.promo_video || null,

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

          start_date:
            data.start_date || null,

          end_date:
            data.end_date || null,

          draw_date:
            data.draw_date || null,

            legal_terms:
            data.legal_terms || null,

          rules:
            data.rules || null,

            legal_document_url:
  data.legal_document_url || null,

          created_by:
            user.id,

          status:
            "draft"

        })
        .select("id")
        .single()

/* =========================================
   INITIAL INVENTORY
========================================= */

if (
  raffleError ||
  !insertedRaffle
) {

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
    insertedRaffle.id

})

    return NextResponse.json({

  ok: true,

  raffle:
    insertedRaffle

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