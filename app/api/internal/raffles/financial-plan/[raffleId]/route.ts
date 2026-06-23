import { NextRequest, NextResponse }
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

  req: NextRequest,

  {
    params
  }: {
    params: {
      raffleId: string
    }
  }

) {

  try {

    const raffleId =
      params.raffleId

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("financial_plans")
        .select("*")
        .eq(
          "raffle_id",
          raffleId
        )
        .maybeSingle()

    if (error) {

      throw error

    }

    return NextResponse.json({

      ok: true,

      plan:
        data || null

    })

  } catch (error) {

    console.error(
      "financial plan load error",
      error
    )

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