import { NextResponse }
from "next/server"

import { z }
from "zod"

import { createClient }
from "@supabase/supabase-js"

import { createFlowPayment }
from "@/lib/raffles/flow/createFlowPayment"

import { trackEvent }
from "@/lib/raffles/analytics/trackEvent"

import { reserveTickets }
from "@/lib/raffles/tickets/reserveTickets"

import { releaseExpiredReservations }
from "@/lib/raffles/tickets/releaseExpiredReservations"

import { releaseOrderReservations }
from "@/lib/raffles/tickets/releaseOrderReservations"

import { processQuote }
from "@/lib/raffles/business/processQuote"

import { createQuoteSnapshot }
from "@/lib/raffles/business/createQuoteSnapshot"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

const blockedEmailDomains = [

  "mailinator.com",

  "guerrillamail.com",

  "yopmail.com",

  "temp-mail.org",

  "10minutemail.com",

  "sharklasers.com"

]

const schema = z.object({

  raffle_id:
    z.string().uuid(),

  quantity:
  z.number()
    .int()
    .min(1)
    .max(20),

  buyer_email:
    z.string().email(),

  buyer_name:
    z.string().min(2),

  buyer_phone:
    z.string().optional(),

  source:
    z.string().optional(),

  referrer:
    z.string().optional(),

  utm_source:
    z.string().optional(),

  utm_medium:
    z.string().optional(),

  utm_campaign:
    z.string().optional(),

  utm_content:
    z.string().optional(),

  utm_term:
    z.string().optional(),

    affiliateCode:
  z.string().optional(),

referralCode:
  z.string().optional()
})

const checkoutRequests = new Map<
  string,
  {
    count: number
    timestamp: number
  }
>()

export async function POST(
  req: Request
) {

  try {

    /* =========================================
   BASIC RATE LIMIT
========================================= */

const forwardedFor =
  req.headers.get(
    "x-forwarded-for"
  )

const ip =
  forwardedFor
    ?.split(",")[0]
    ?.trim() || "unknown"

const now = Date.now()

const current =
  checkoutRequests.get(ip)

if (
  current &&
  now - current.timestamp <
    60_000
) {

  if (current.count >= 10) {

    return NextResponse.json(

      {
        error:
          "rate_limit"
      },

      {
        status: 429
      }
    )
  }

  current.count += 1

  checkoutRequests.set(
    ip,
    current
  )

} else {

  checkoutRequests.set(ip, {

    count: 1,

    timestamp: now
  })

}

    /* =========================================
       CLEANUP EXPIRED RESERVATIONS
    ========================================= */

    await releaseExpiredReservations()

    /* =========================================
       PARSE BODY
    ========================================= */

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

  buyer_email,
  buyer_name,
  buyer_phone,

  source,
  referrer,

  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,

  affiliateCode,
  referralCode

} = parsed.data

/* =========================================
   BLOCK TEMP EMAILS
========================================= */

const emailDomain =
  buyer_email
    .split("@")[1]
    ?.toLowerCase()

if (
  emailDomain &&
  blockedEmailDomains.includes(
    emailDomain
  )
) {

  return NextResponse.json(

    {
      error:
        "invalid_email"
    },

    {
      status: 400
    }
  )
}

    /* =========================================
       REQUEST METADATA
    ========================================= */

    const headers =
      req.headers

    const ip_address =
      headers.get("x-forwarded-for") ||
      headers.get("x-real-ip") ||
      "unknown"

    const user_agent =
      headers.get("user-agent") ||
      "unknown"

    /* =========================================
       LOAD RAFFLE
    ========================================= */

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

    /* =========================================
       EXISTING PENDING ORDER
    ========================================= */

    const { data: existingOrder } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select("id")
        .eq("raffle_id", raffle_id)
        .eq("buyer_email", buyer_email)
        .eq("status", "pending")
        .gte(
          "created_at",
          new Date(
            Date.now() - 15 * 60 * 1000
          ).toISOString()
        )
        .maybeSingle()

    if (existingOrder) {

      return NextResponse.json(
        {
          error:
            "pending_order_exists"
        },
        {
          status: 409
        }
      )
    }

    /* =========================================
QUOTE ENGINE
========================================= */

const quote =
await processQuote({

    raffleId:
        raffle_id,

    quantity,

    tracking: {

    source,

    referrer,

    affiliateCode:
        affiliateCode ?? undefined,

    referralCode:
        referralCode ?? undefined,

    couponCode:
        undefined,

        utm_source,

        utm_medium,

        utm_campaign,

        utm_content,

        utm_term,

        ip:
            ip_address,

        userAgent:
            user_agent

    }

})

const totalCLP =
  quote.total

    /* =========================================
       CREATE ORDER
    ========================================= */

    const {
  data: order,
  error: orderError
} =
      await supabase
        .schema("raffles")
        .from("orders")
        .insert({

          raffle_id,

          buyer_name,

          buyer_email,

          buyer_phone,

          quantity,

          metadata: {

  quote:
    createQuoteSnapshot(
      quote
    ),

  tracking: {

    affiliateCode:
      affiliateCode ?? null,

    referralCode:
      referralCode ?? null,

    source:
      source ?? null,

    referrer:
      referrer ?? null,

    utm_source:
      utm_source ?? null,

    utm_medium:
      utm_medium ?? null,

    utm_campaign:
      utm_campaign ?? null,

    utm_content:
      utm_content ?? null,

    utm_term:
      utm_term ?? null

  }

},

          subtotal_clp:
            totalCLP,

          total_clp:
            totalCLP,

          currency:
            "CLP",

          status:
            "pending",

          source:
            source || "direct",

          referrer:
            referrer || null,

          utm_source:
            utm_source || null,

          utm_medium:
            utm_medium || null,

          utm_campaign:
            utm_campaign || null,

          utm_content:
            utm_content || null,

          utm_term:
            utm_term || null,

          ip_address,

          user_agent

        })
        .select()
        .single()

    if (orderError || !order) {

  console.error(
    "ORDER INSERT ERROR",
    orderError
  )

  return NextResponse.json(
    {
      error: "order_error",
      details: orderError
    },
    {
      status: 500
    }
  )
}

    /* =========================================
       RESERVE TICKETS
    ========================================= */

    try {

  await reserveTickets({

    raffle_id,

    order_id:
      order.id,

    buyer_email,

    quantity:

quote.finalQuantity

  })

} catch (reservationError) {

  console.error(
    "RESERVATION ERROR",
    reservationError
  )

  await supabase
    .schema("raffles")
    .from("orders")
    .update({

      status: "cancelled"

    })
    .eq("id", order.id)

  throw reservationError
}

    /* =========================================
       CREATE FLOW PAYMENT
    ========================================= */

    const flow =
      await createFlowPayment({

        orderId:
          order.id,

        amount:
          totalCLP,

        email:
          buyer_email,

        subject:
          `Compra tickets ${raffle.title}`

      })

    if (!flow?.token) {

  await releaseOrderReservations(
    order.id
  )

  await supabase
    .schema("raffles")
    .from("orders")
    .update({

      status: "cancelled"

    })
    .eq("id", order.id)

  return NextResponse.json(
    {
      error: "flow_error"
    },
    {
      status: 500
    }
  )
}

    /* =========================================
       CREATE PAYMENT ROW
    ========================================= */

    const {
  data: payment,
  error: paymentError
} =
  await supabase
    .schema("raffles")
    .from("payments")
    .insert({

      raffle_id,

      order_id:
        order.id,

      provider:
        "flow",

      provider_payment_id:
        flow.token,

      status:
        "pending",

      amount_clp:
        totalCLP,

      metadata: {

        flow_payment_url:
          flow.url

      }

    })
    .select()
    .single()

if (paymentError || !payment) {

  console.error(
    "PAYMENT INSERT ERROR",
    paymentError
  )

  await releaseOrderReservations(
    order.id
  )

  await supabase
    .schema("raffles")
    .from("orders")
    .update({

      status: "cancelled"

    })
    .eq("id", order.id)

  return NextResponse.json(
    {
      error:
        "payment_insert_failed"
    },
    {
      status: 500
    }
  )
}

    /* =========================================
       ANALYTICS
    ========================================= */

    await trackEvent({

      event_type:
        "begin_checkout",

      raffle_id,

      order_id:
        order.id,

      payment_id:
        payment?.id,

      user_email:
        buyer_email,

      source,
      referrer,

      utm_source,
      utm_medium,
      utm_campaign,

      ip:
        ip_address,

      user_agent,

      metadata: {

        requestedQuantity:
        quote.requestedQuantity,

        bonusQuantity:
        quote.bonusQuantity,

        finalQuantity:
        quote.finalQuantity,

        amount_clp:
          totalCLP,

        currency:
          "CLP",

        provider:
          "flow"

      }

    })

if (affiliateCode) {

  await trackEvent({

    event_type:
      "affiliate_conversion",

    raffle_id,

    order_id:
      order.id,

    payment_id:
      payment?.id,

    user_email:
      buyer_email,

    source,

    referrer,

    ip:
      ip_address,

    user_agent,

    metadata: {

      affiliateCode,

      requestedQuantity:
        quote.requestedQuantity,

      finalQuantity:
        quote.finalQuantity,

      total:
        quote.total

    }

  })

}

    return NextResponse.json({

      payment_id:
        payment?.id,

      order_id:
        order.id,

      url:
        flow.url,

      token:
        flow.token

    })

   } catch (error: any) {

    console.error(
      "create-payment error",
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          "server_error",

        details:
          JSON.stringify(error)
      },
      {
        status: 500
      }
    )
  }
}