import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    const { searchParams } =
      new URL(req.url)

    const email =
      searchParams.get("email")

    if (!email) {

      return NextResponse.json(
        {
          error: "email_required"
        },
        {
          status: 400
        }
      )
    }

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          id,
          ticket_code,
          status,
          created_at,
          raffle_id
        `)
        .eq(
          "buyer_email",
          email
        )
        .eq(
          "status",
          "paid"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    if (error) {

      console.error(error)

      return NextResponse.json(
        []
      )
    }

    const raffleIds =
      [...new Set(
        (data || []).map(
          ticket => ticket.raffle_id
        )
      )]

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
          status
        `)
        .in(
          "id",
          raffleIds.length
            ? raffleIds
            : ["00000000-0000-0000-0000-000000000000"]
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
      (data || []).map(
        ticket => ({

          ...ticket,

          raffle:
            raffleMap.get(
              ticket.raffle_id
            ) || null

        })
      )

    return NextResponse.json(
      result
    )

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      []
    )
  }
}