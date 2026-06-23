import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(

  req: NextRequest,

  context: {
    params: Promise<{
      raffleId: string
    }>
  }

) {

  try {

    const { raffleId } =
      await context.params

    /* =========================
       PLAN
    ========================= */

    const {
      data: plan
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

    if (!plan) {

      return NextResponse.json({

        exists: false

      })

    }

    /* =========================
       REVENUE REAL
    ========================= */

    const {
      data: payments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          amount_clp
        `)
        .eq(
          "raffle_id",
          raffleId
        )
        .eq(
          "status",
          "approved"
        )

    const revenue =
      (payments || [])
        .reduce(

          (sum, payment) =>

            sum +
            Number(
              payment.amount_clp || 0
            ),

          0

        )

    const surplusRevenue =
      Math.max(
        0,
        revenue -
        Number(
          plan.required_revenue || 0
        )
      )

    /* =========================
       EXTRA PRIZES
    ========================= */

    const {
      data: prizes
    } =
      await supabase
        .schema("raffles")
        .from("financial_extra_prizes")
        .select("*")
        .eq(
          "raffle_id",
          raffleId
        )
        .eq(
          "active",
          true
        )

    const scenarios =
      (prizes || [])
        .map(prize => ({

          ...prize,

          possible:

            surplusRevenue >=
            Number(
              prize.cost || 0
            )

        }))

    return NextResponse.json({

      exists: true,

      revenue,

      requiredRevenue:
        plan.required_revenue,

      surplusRevenue,

      scenarios

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