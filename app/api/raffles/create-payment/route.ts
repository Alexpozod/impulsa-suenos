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
    z.number()
      .min(1)
      .max(100),

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
    z.string().optional()
})

export async function POST(
  req: Request
) {

  try {

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
      utm_term

    } = parsed.data

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
       CALCULATE TOTALS
    ========================================= */

    const ticketPriceCLP =
      Number(
        raffle.ticket_price_clp
      )

    const totalCLP =
      ticketPriceCLP * quantity

    /* =========================================
       CREATE ORDER
    ========================================= */

    const { data: order } =
      await supabase
        .schema("raffles")
        .from("orders")
        .insert({

          raffle_id,

          buyer_name,

          buyer_email,

          buyer_phone,

          quantity,

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

    /* =========================================
       RESERVE TICKETS
    ========================================= */

    await reserveTickets({

      raffle_id,

      order_id:
        order.id,

      buyer_email,

      quantity

    })

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

    const { data: payment } =
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

        quantity,

        amount_clp:
          totalCLP,

        currency:
          "CLP",

        provider:
          "flow"

      }

    })

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

  } catch (error) {

    console.error(
      "create-payment error",
      error
    )

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