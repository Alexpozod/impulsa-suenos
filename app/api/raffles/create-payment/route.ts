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

  user_email:
    z.string().email(),

  source:
    z.string().optional(),

  referrer:
    z.string().optional(),

  utm_source:
    z.string().optional(),

  utm_medium:
    z.string().optional(),

  utm_campaign:
    z.string().optional()

})

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const headers = req.headers

    const ip =
    headers.get("x-forwarded-for") ||
    headers.get("x-real-ip") ||
    "unknown"

    const userAgent =
    headers.get("user-agent") ||
    "unknown"

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
        user_email,

        source,
        referrer,

        utm_source,
        utm_medium,
        utm_campaign

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

/* =========================
   🔒 EXISTING PENDING ORDER
========================= */

const { data: existingOrder } =
  await supabase
    .schema("raffles")
    .from("orders")
    .select("*")
    .eq(
      "raffle_id",
      raffle_id
    )
    .eq(
      "user_email",
      user_email
    )
    .eq(
      "status",
      "pending"
    )
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

status: "pending",

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

ip,

user_agent:
  userAgent

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

        orderId: order.id,

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

await trackEvent({

  event_type:
    "begin_checkout",

  raffle_id,

  order_id:
    order.id,

  user_email,

  source,
  referrer,

  utm_source,
  utm_medium,
  utm_campaign,

  ip,

  user_agent:
    userAgent,

  metadata: {

    quantity,

    amount,

    currency:
      raffle.currency || "CLP"

  }

})

    const { data: payment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .insert({

          orderId: order.id,

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