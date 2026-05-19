import { NextResponse }
from "next/server"

import axios from "axios"

import { createClient }
from "@supabase/supabase-js"

import { validateFlowSignature }
from "@/lib/raffles/flow/validateFlowSignature"

import { generateTickets }
from "@/lib/raffles/tickets/generateTickets"

import { processRafflePayment }
from "@/lib/raffles/ledger/processRafflePayment"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const body =
      await req.formData()

    const data =
      Object.fromEntries(body.entries())

    const valid =
      validateFlowSignature(data)

    if (!valid) {

      return NextResponse.json(
        { error: "invalid_signature" },
        { status: 401 }
      )
    }

    const token =
      String(data.token)

    const existingWebhook =
      await supabase
        .schema("raffles")
        .from("webhook_events")
        .select("id")
        .eq("event_id", token)
        .maybeSingle()

    if (existingWebhook.data) {

      return NextResponse.json({
        ok: true
      })
    }

    const response = await axios.get(

      `${process.env.FLOW_BASE_URL}/payment/getStatus`,

      {
        params: {
          apiKey:
            process.env.FLOW_API_KEY,
          token
        }
      }
    )

    const payment =
      response.data

    await supabase
      .schema("raffles")
      .from("webhook_events")
      .insert({

        provider: "flow",

        event_id: token,

        event_type: "payment",

        payload: payment,

        processed: true

      })

    if (payment.status !== 2) {

      return NextResponse.json({
        ok: true
      })
    }

    const { data: dbPayment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select("*")
        .eq(
          "provider_payment_id",
          token
        )
        .maybeSingle()

    if (!dbPayment) {

      return NextResponse.json({
        ok: true
      })
    }

    if (dbPayment.status === "approved") {

      return NextResponse.json({
        ok: true
      })
    }

    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        status: "approved",

        paid_at:
          new Date().toISOString()

      })
      .eq("id", dbPayment.id)

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        status: "paid"

      })
      .eq("id", dbPayment.order_id)

    const { data: order } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select("*")
        .eq("id", dbPayment.order_id)
        .maybeSingle()

    if (!order) {

      return NextResponse.json({
        ok: true
      })
    }

    await generateTickets({

  order_id: order.id,

  raffle_id: order.raffle_id,

  quantity: order.quantity

})

await processRafflePayment({

  payment_id: dbPayment.id,

  raffle_id: order.raffle_id,

  order_id: order.id,

  amount: Number(dbPayment.amount),

  provider_fee:
    Number(payment.fee || 0)

})

    return NextResponse.json({
      ok: true
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}