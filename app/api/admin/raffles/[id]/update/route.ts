import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {

  try {

    const authHeader =
      req.headers.get("authorization")

    const token =
      authHeader?.replace(
        "Bearer ",
        ""
      )

    if (!token) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )

    }

    const {
      data: { user }
    } =
      await supabase.auth.getUser(
        token
      )

    if (!user) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )

    }

    await requireRaffleAdmin({
      user_id: user.id
    })

    const { id } =
      await context.params

    const body =
      await req.json()

    const {
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .update({

          title: body.title,
          slug: body.slug,
          description: body.description,

          prize_title:
            body.prize_title,

          prize_description:
            body.prize_description,

          cover_image:
            body.cover_image,

          gallery:
            body.gallery,

          promo_video:
            body.promo_video,

          ticket_price:
            body.ticket_price,

          ticket_price_clp:
            body.ticket_price,

          ticket_prefix:
            body.ticket_prefix,

          ticket_min_number:
            body.ticket_min_number,

          ticket_max_number:
            body.ticket_max_number,

          min_tickets_goal:
            body.min_tickets_goal,

          start_date:
  body.start_date?.trim()
    ? body.start_date
    : null,

end_date:
  body.end_date?.trim()
    ? body.end_date
    : null,

draw_date:
  body.draw_date?.trim()
    ? body.draw_date
    : null,

    legal_terms:
  body.legal_terms || null,

rules:
  body.rules || null,

          updated_at:
            new Date()
              .toISOString()

        })
        .eq("id", id)

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error: error.message
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
        error: "server_error"
      },
      {
        status: 500
      }
    )

  }

}