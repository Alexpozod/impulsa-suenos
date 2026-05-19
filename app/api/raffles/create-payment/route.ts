import { NextResponse }
from "next/server"

import { z }
from "zod"

import { createClient }
from "@supabase/supabase-js"

import { createFlowPayment }
from "@/lib/raffles/flow/createFlowPayment"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

const schema = z.object({

  raffle_id:
    z.string().uuid(),

  quantity:
    z.number().min(1),

  user_email:
    z.string().email()

})

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const parsed =
      schema.safeParse(body)

    if (!parsed.success) {

      return NextResponse.json(
        {
          error: "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const {

      raffle_id,
      quantity,
      user_email

    } = parsed.data

    const { data: raffle } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select("*")
        .eq("id", raffle_id)
        .maybeSingle()

    if (!raffle) {

      return NextResponse.json(
        {
          error: "raffle_not_found"
        },
        {
          status: 404
        }
      )
    }

    if (raffle.status !== "active") {

      return NextResponse.json(
        {
          error: "raffle_inactive"
        },
        {
          status: 400
        }
      )
    }

    const amount =
      Number(
        raffle.ticket_price
      ) * quantity

    const { data: order } =
      await supabase
        .schema("raffles")
        .from("orders")
        .insert({

          raffle_id,

          user_email,

          quantity,

          amount,

          currency:
            raffle.currency || "CLP",

          status: "pending"

        })
        .select()
        .single()

    if (!order) {

      return NextResponse.json(
        {
          error: "order_error"
        },
        {
          status: 500
        }
      )
    }

    const flow =
      await createFlowPayment({

        order_id: order.id,

        amount,

        email: user_email,

        subject:
          `Compra tickets ${raffle.title}`

      })

    if (!flow?.token) {

      return NextResponse.json(
        {
          error: "flow_error"
        },
        {
          status: 500
        }
      )
    }

    const { data: payment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .insert({

          order_id: order.id,

          raffle_id,

          user_email,

          amount,

          currency:
            raffle.currency || "CLP",

          provider: "flow",

          provider_payment_id:
            flow.token,

          status: "pending"

        })
        .select()
        .single()

    return NextResponse.json({

      payment_id:
        payment?.id,

      url:
        flow.url,

      token:
        flow.token

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )
  }
}