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
  req: Request,
  context: {
    params: Promise<{
      slug: string
    }>
  }
) {

  try {

    const params =
      await context.params

    /* =========================
       LOAD RAFFLE
    ========================= */

    const {
      data: raffle,
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select(`
          id,
          slug,
          title,
          description,
          short_description,
          prize_title,
          prize_description,
          cover_image,
          gallery,
          promo_video,
          legal_document_url,
          ticket_price_clp,
          currency,
          generated_ticket_count,
          sold_ticket_count,
          reserved_ticket_count,
          min_tickets_goal,
          ticket_min_number,
          ticket_max_number,
          status,
          end_date,
          created_at
        `)
        .eq(
          "slug",
          params.slug
        )
        .in(
  "status",
  [
    "active",
    "paused",
    "ended",
    "completed"
  ]
)
        .maybeSingle()

    if (error || !raffle) {

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

    /* =========================
       METRICS
    ========================= */

    const totalTickets =
      Number(
        raffle.ticket_max_number || 0
      )

    const soldTickets =
      Number(
        raffle.sold_ticket_count || 0
      )

    const reservedTickets =
      Number(
        raffle.reserved_ticket_count || 0
      )

    const availableTickets =
      totalTickets -
      soldTickets -
      reservedTickets

    const progress =
      totalTickets > 0

        ? Math.min(
            100,
            (
              soldTickets /
              totalTickets
            ) * 100
          )

        : 0

    const revenue =
      soldTickets *
      Number(
        raffle.ticket_price_clp || 0
      )

    /* =========================
       INVENTORY PREVIEW
    ========================= */

    const {
      data: previewTickets
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          ticket_code,
          status
        `)
        .eq(
          "raffle_id",
          raffle.id
        )
        .order(
          "ticket_number",
          {
            ascending: true
          }
        )
        .limit(30)

/* =========================
   WINNERS
========================= */

const {
  data: winners
} =
  await supabase
    .schema("raffles")
    .from("raffle_results")
    .select(`
  id,
  ticket_code,
  prize_title,
  prize_position,
  winner_name,
  visibility_mode,
  delivery_status,
  evidence_images,
  evidence_videos
`)
    .eq(
      "raffle_id",
      raffle.id
    )
    .eq(
      "visibility_mode",
      "public"
    )
    .order(
      "prize_position",
      {
        ascending: true
      }
    )

    return NextResponse.json({

      ok: true,

      raffle: {

        ...raffle,

        total_tickets:
          totalTickets,

        available_tickets:
          availableTickets,

        sold_tickets:
          soldTickets,

        reserved_tickets:
          reservedTickets,

        progress:
          Number(
            progress.toFixed(2)
          ),

        revenue

      },

      preview_tickets:
        previewTickets || [],

        winners:
        winners || []

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