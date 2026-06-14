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

console.log(
  "PAYMENT PIPELINE",
  pipelineResult
)

if (
  pipelineResult.status ===
  "ignored"
) {

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

// Payment aprobado por el Payment Pipeline

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

const fraudReasons: string[] = []

/* =========================
   SUSPICIOUS IP
========================= */

const suspiciousIps = [

  "unknown",
  "::1"

]

if (
  suspiciousIps.includes(
    order.ip_address || ""
  )
) {

  fraudReasons.push(
    "suspicious_ip"
  )
}

/* =========================
   HIGH TICKET VOLUME
========================= */

if (
  Number(order.quantity) >= 10
) {

  fraudReasons.push(
    "high_ticket_volume"
  )
}

/* =========================
   SAME IP RECENT PAYMENTS
========================= */

const recentWindow =
  new Date(
    Date.now() -
    60 * 60 * 1000
  ).toISOString()

const {
  data: recentOrders
} =
  await supabase
    .schema("raffles")
    .from("orders")
    .select("id")
    .eq(
      "ip_address",
      order.ip_address
    )
    .gte(
      "created_at",
      recentWindow
    )

if (
  (recentOrders?.length || 0) >= 5
) {

  fraudReasons.push(
    "multiple_orders_same_ip"
  )
}

/* =========================
   SAVE FRAUD LOGS
========================= */

for (
  const reason of fraudReasons
) {

  const {
    data: existingFraud
  } =
    await supabase
      .schema("raffles")
      .from("fraud_logs")
      .select("id")
      .eq(
        "payment_id",
        dbPayment.id
      )
      .eq(
        "reason",
        reason
      )
      .maybeSingle()

  if (!existingFraud) {

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

        reason,

        risk_level:

          fraudReasons.length >= 3

            ? "high"

            : fraudReasons.length >= 2

              ? "medium"

              : "low"
      })

  }

}
  
/* =========================
   PREVENT DUPLICATE SUCCESS
========================= */

const {
  data: existingSuccessEvent
} =
  await supabase
    .schema("raffles")
    .from("analytics_events")
    .select("id")
    .eq(
      "payment_id",
      dbPayment.id
    )
    .eq(
      "event_type",
      "payment_success"
    )
    .maybeSingle()

if (
  existingSuccessEvent
) {

  return NextResponse.json({
    ok: true
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
  pipelineTickets

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