import { NextResponse }
from "next/server"

import axios from "axios"

import { createClient }
from "@supabase/supabase-js"

import { releaseOrderReservations }
from "@/lib/raffles/tickets/releaseOrderReservations"

import { trackEvent }
from "@/lib/raffles/analytics/trackEvent"

import { validateFlowSignature }
from "@/lib/raffles/flow/validateFlowSignature"

import {
  processPayment
} from "@/lib/raffles/payment"

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

console.log(
"FLOW WEBHOOK RAW DATA",
data
)

/* =========================
FLOW SIGNATURE CHECK
========================= */

/*
Flow actualmente no envía
el parámetro "s" en este webhook.

La validación se mantiene
solo para monitoreo.

La validación real del pago
se realiza consultando
/payment/getStatus
directamente a Flow.
*/

const signatureValid =
validateFlowSignature(
data as Record<string, any>
)

console.log(
"FLOW SIGNATURE VALID",
signatureValid
)


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

    const statusParams = {

  apiKey:
    process.env.FLOW_API_KEY,

  token

}

const keys =
  Object.keys(statusParams).sort()

const toSign =
  keys
    .map(
      key =>
        `${key}${statusParams[key as keyof typeof statusParams]}`
    )
    .join("")

const s =
  require("crypto-js")
    .HmacSHA256(

      toSign,

      process.env
        .FLOW_SECRET_KEY!

    )
    .toString()

const response =
  await axios.get(

    `${process.env.FLOW_BASE_URL}/payment/getStatus`,

    {
      params: {

        apiKey:
          process.env.FLOW_API_KEY,

        token,

        s
      }
    }
  )

    const payment =
      response.data

      console.log(
  "FLOW PAYMENT STATUS",
  payment
)

console.log(
  "FLOW STATUS NUMBER",
  payment.status
)

if (payment.status === 3) {

  console.log(
    "FLOW PAYMENT REJECTED"
  )
}

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

    if (
  payment.status !== FLOW_STATUS_APPROVED &&
  payment.status !== 1
) {

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

    /* =========================
       CANCEL FAILED ORDER
    ========================= */

    await supabase
  .schema("raffles")
  .from("payments")
  .update({

    status: "failed"

  })
  .eq(
    "provider_payment_id",
    token
  )

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        status: "cancelled"

      })
      .eq(
        "id",
        dbPayment.orders.id
      )

    /* =========================
       RELEASE RESERVED TICKETS
    ========================= */

    await releaseOrderReservations(
      dbPayment.orders.id
    )

  }

  return NextResponse.json({
    ok: true
  })
}

const pipelineResult =
  await processPayment({

    provider: "flow",

    providerToken: token,

    paymentId: token,

    providerFee:
      Number(payment.fee || 0)

  })

  const pipelineTickets =
  pipelineResult.tickets ?? []

if (
  pipelineResult.status === "ignored"
) {

  return NextResponse.json({
    ok: true
  })

}

if (
  pipelineResult.status === "completed"
) {

  return NextResponse.json({
    ok: true
  })

}
   
/* =========================
   AFFILIATE COMMISSION
========================= */

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