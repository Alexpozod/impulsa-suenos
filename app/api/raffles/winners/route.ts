import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET() {

  try {

    const {
      data: winners,
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .select(`
          id,
          raffle_id,
          ticket_code,
          prize_title,
          prize_position,
          winner_name,
          delivery_status,
          evidence_images
        `)
        .eq(
          "visibility_mode",
          "public"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    if (error) {

      console.error(error)

      return NextResponse.json([])
    }

    const raffleIds =
[
  ...new Set(
    (winners || []).map(
      winner => winner.raffle_id
    )
  )
]

const {
  data: raffles
} =
await supabase
  .schema("raffles")
  .from("raffles")
  .select(`
    id,
    title,
    slug,
    cover_image,
    end_date
  `)
  .in(
    "id",
    raffleIds.length
      ? raffleIds
      : [
          "00000000-0000-0000-0000-000000000000"
        ]
  )

  const raffleMap =
  new Map(

    (raffles || []).map(
      raffle => [

        raffle.id,

        raffle

      ]
    )

  )

   const result =

(winners || []).map(

  winner => ({

    ...winner,

    raffle:

      raffleMap.get(
        winner.raffle_id
      ) || null

  })

)

return NextResponse.json(
  result
)

  } catch (error) {

    console.error(error)

    return NextResponse.json([])
  }
}