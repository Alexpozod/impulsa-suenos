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
  req: Request
) {

  try {

    const { searchParams } =
      new URL(req.url)

    const rawTicket =
      searchParams.get("ticket")

    const ticket =
      rawTicket
        ?.trim()
        ?.toUpperCase()

    /* =========================
       INPUT VALIDATION
    ========================= */

    if (
      !ticket ||
      ticket.length < 3 ||
      ticket.length > 50
    ) {

      return NextResponse.json(
        {
          valid: false
        },
        {
          status: 400
        }
      )
    }

    /* =========================
       LOAD TICKET
    ========================= */

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          ticket_code,
          ticket_number,
          status,

          raffles (
            title,
            slug,
            status
          )
        `)
        .or(`
          ticket_code.eq.${ticket},
          ticket_number.eq.${ticket}
        `)
        .in(
          "status",
          [
            "paid",
            "winner"
          ]
        )
        .maybeSingle()

    if (error || !data) {

      return NextResponse.json({

        valid: false

      })
    }

    /* =========================
       SAFE RELATION
    ========================= */

    const raffleData =
      Array.isArray(data.raffles)
        ? data.raffles[0]
        : data.raffles

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({

      valid: true,

      ticket: {

        ticket_code:
          data.ticket_code,

        ticket_number:
          data.ticket_number,

        status:
          data.status,

        raffle: {

          title:
            raffleData?.title,

          slug:
            raffleData?.slug,

          status:
            raffleData?.status

        }

      }

    })

  } catch (error) {

    console.error(
      "validate-ticket error",
      error
    )

    return NextResponse.json(

      {
        valid: false
      },

      {
        status: 500
      }
    )
  }
}