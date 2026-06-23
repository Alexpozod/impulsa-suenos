import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

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

      prize_cost,
      fixed_costs,

      marketing_percent,
      influencer_percent,

      flow_percent,
      iva_percent,

      target_profit,

      ticket_price,

      required_revenue,

      minimum_tickets,

      break_even_tickets

    } = body

    if (!raffle_id) {

      return NextResponse.json(
        {
          error:
            "raffle_required"
        },
        {
          status: 400
        }
      )

    }

    const {
      data: existing
    } =
      await supabase
  .schema("raffles")
  .from("raffle_financial_plans")
  .select("id")
        .eq(
          "raffle_id",
          raffle_id
        )
        .maybeSingle()

    if (existing) {

      const {
        error
      } =
        await supabase
  .schema("raffles")
  .from("raffle_financial_plans")
  .update({

            prize_cost,
            fixed_costs,

            marketing_percent,
            influencer_percent,

            flow_percent,
            iva_percent,

            target_profit,

            ticket_price,

            required_revenue,

            minimum_tickets,

            break_even_tickets,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "raffle_id",
            raffle_id
          )

      if (error) {

        throw error

      }

    } else {

      const {
        error
      } =
        await supabase
  .schema("raffles")
  .from("raffle_financial_plans")
  .insert({

            raffle_id,

            prize_cost,
            fixed_costs,

            marketing_percent,
            influencer_percent,

            flow_percent,
            iva_percent,

            target_profit,

            ticket_price,

            required_revenue,

            minimum_tickets,

            break_even_tickets

          })

      if (error) {

        throw error

      }

    }

    return NextResponse.json({

      ok: true

    })

  } catch (error) {

    console.error(
      "financial plan save error",
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