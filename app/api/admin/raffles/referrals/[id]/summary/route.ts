import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(

  req: Request,

  context: {

    params: Promise<{
      id: string
    }>

  }

) {

  try {

    const { id } =
      await context.params

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("ledger")
        .select(
          "amount_clp,type,metadata"
        )
        .contains(
          "metadata",
          {
            referralId: id
          }
        )

    if (error) {

      throw error

    }

    const rewards =
      (data ?? []).filter(

        (row:any)=>

          row.type ===
          "referral_reward"

      )

    const totalEarned =
      rewards.reduce(

        (sum:number,row:any)=>

          sum +
          Math.abs(
            Number(
              row.amount_clp || 0
            )
          ),

        0

      )

    return NextResponse.json({

      totalEarned,

      conversions:
        rewards.length

    })

  }

  catch (error) {

    console.error(error)

    return NextResponse.json(

      {

        totalEarned: 0,

        conversions: 0

      },

      {

        status: 500

      }

    )

  }

}