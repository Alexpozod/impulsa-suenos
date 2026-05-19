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

    const ticket =
      searchParams.get("ticket")

    if (!ticket) {

      return NextResponse.json({

        valid: false

      })
    }

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("tickets")
        .select(`
          id,
          ticket_code,
          ticket_number,
          status,
          created_at,

          raffles (
            id,
            title,
            slug,
            status
          )
        `)
        .or(`
          ticket_code.eq.${ticket},
          ticket_number.eq.${ticket}
        `)
        .maybeSingle()

    if (error || !data) {

      return NextResponse.json({

        valid: false

      })
    }

    return NextResponse.json({

      valid: true,

      ticket: data

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({

      valid: false

    })
  }
}