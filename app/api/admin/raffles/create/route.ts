import { NextResponse }
from "next/server"

import { z }
from "zod"

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

    const { data: raffle } =
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

          ticket_price:
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

          status:
            "active"

        })
        .select()
        .single()

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