import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest
) {

  try {

    const body =
      await req.json()

    const {
      raffle_id,
      name,
      cost
    } = body

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("financial_extra_prizes")
        .insert({

          raffle_id,

          name,

          cost,

          active: true

        })
        .select()
        .single()

    if (error) {

      throw error

    }

    return NextResponse.json({

      ok: true,

      prize: data

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        error:
          "server_error"

      },

      {

        status:500

      }

    )

  }

}

export async function GET(
  req: NextRequest
) {

  try {

    const raffleId =
      req.nextUrl.searchParams.get(
        "raffle_id"
      )

    if (!raffleId) {

      return NextResponse.json({

        prizes: []

      })

    }

    const {
      data
    } =
      await supabase
        .schema("raffles")
        .from("financial_extra_prizes")
        .select("*")
        .eq(
          "raffle_id",
          raffleId
        )
        .order(
          "created_at",
          {
            ascending:false
          }
        )

    return NextResponse.json({

      prizes:
        data || []

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        error:
          "server_error"

      },

      {

        status:500

      }

    )

  }

}