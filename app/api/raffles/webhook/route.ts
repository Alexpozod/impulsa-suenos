import { NextResponse }
from "next/server"

import axios from "axios"

import { createClient }
from "@supabase/supabase-js"

import { validateFlowSignature }
from "@/lib/raffles/flow/validateFlowSignature"

import { assignReservedTickets }
from "@/lib/raffles/tickets/assignReservedTickets"

import { processRafflePayment }
from "@/lib/raffles/ledger/processRafflePayment"

import { trackEvent }
from "@/lib/raffles/analytics/trackEvent"

import { sendRaffleConfirmationEmail }
from "@/lib/raffles/emails/sendRaffleConfirmationEmail"

import { sendTicketsEmail }
from "@/lib/raffles/emails/sendTicketsEmail"

export const runtime = "nodejs"

const FLOW_STATUS_APPROVED = 2

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

    if (payment.status !== FLOW_STATUS_APPROVED) {

  const { data: dbPayment } =
    await supabase
      .schema("raffles")
      .from("payments")
      .select(`
        *,
        orders (*)
      `)
      .eq(
        "provider_payment_id",
        token
      )
      .maybeSingle()

  if (dbPayment?.orders) {

    await trackEvent({

      event_type:
        "payment_failed",

      raffle_id:
        dbPayment.orders.raffle_id,

      order_id:
        dbPayment.orders.id,

      payment_id:
        dbPayment.id,

      user_email:
        dbPayment.orders.buyer_email,

      source:
        dbPayment.orders.source,

      referrer:
        dbPayment.orders.referrer,

      utm_source:
        dbPayment.orders.utm_source,

      utm_medium:
        dbPayment.orders.utm_medium,

      utm_campaign:
        dbPayment.orders.utm_campaign,

      ip:
  dbPayment.orders.ip_address,

      user_agent:
        dbPayment.orders.user_agent,

      metadata: {

        provider:
          "flow",

        flow_status:
          payment.status

      }

    })

  }

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

    if (
  dbPayment.status === "approved" ||
  dbPayment.status === "processing"
) {

  return NextResponse.json({
    ok: true
  })
}

const { data: lockedPayment } =
  await supabase
    .schema("raffles")
    .from("payments")
    .update({

      status: "processing"

    })
    .eq("id", dbPayment.id)
    .eq("status", "pending")
    .select()
    .maybeSingle()

if (!lockedPayment) {

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

/* =========================
   🚨 FRAUD CHECK
========================= */

const suspiciousIps = [

  "unknown",
  "::1"

]

const suspicious =
  suspiciousIps.includes(
    order.ip_address || ""
  )

if (suspicious) {

  await supabase
    .schema("raffles")
    .from("fraud_logs")
    .insert({

      payment_id:
        dbPayment.id,

      order_id:
        order.id,

      raffle_id:
        order.raffle_id,

      user_email:
  order.buyer_email,

      ip:
        order.ip_address,

      user_agent:
        order.user_agent,

      reason:
        "suspicious_ip",

      risk_level:
        "medium"
    })
}

    await trackEvent({

  event_type:
    "payment_success",

  raffle_id:
    order.raffle_id,

  order_id:
    order.id,

  payment_id:
    dbPayment.id,

  user_email:
  order.buyer_email,

  source:
    order.source,

  referrer:
    order.referrer,

  utm_source:
    order.utm_source,

  utm_medium:
    order.utm_medium,

  utm_campaign:
    order.utm_campaign,

  ip:
    order.ip_address,

  user_agent:
    order.user_agent,

  metadata: {

    quantity:
      order.quantity,

    amount:
      order.total_clp,

    currency:
      order.currency,

    provider:
      "flow"

  }

})

   const tickets =
  await assignReservedTickets({

    raffle_id:
      order.raffle_id,

    order_id:
      order.id,

    payment_id:
      dbPayment.id

  })

await processRafflePayment({

  payment_id: dbPayment.id,

  raffle_id: order.raffle_id,

  order_id: order.id,

  amount: Number(dbPayment.amount_clp),

  provider_fee:
    Number(payment.fee || 0)

})

await sendRaffleConfirmationEmail(
  order.id
)

const { data: raffle } =
  await supabase
    .schema("raffles")
    .from("raffles")
    .select("title")
    .eq(
      "id",
      order.raffle_id
    )
    .maybeSingle()

await sendTicketsEmail({

  email:
  order.buyer_email,

  raffleTitle:
    raffle?.title ||
    "Sorteo",

  tickets

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