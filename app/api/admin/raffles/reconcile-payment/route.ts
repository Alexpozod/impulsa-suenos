import { NextResponse }
from "next/server"

import axios from "axios"

import { createClient }
from "@supabase/supabase-js"

import { assignReservedTickets }
from "@/lib/raffles/tickets/assignReservedTickets"

import { processRafflePayment }
from "@/lib/raffles/ledger/processRafflePayment"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FLOW_STATUS_APPROVED = 2

export async function POST(
  req: Request
) {

  try {

const auth =
  await requireAdminAccess(req)

if (!auth.authorized) {

  return NextResponse.json(
    {
      error: "unauthorized"
    },
    {
      status: 401
    }
  )

}

    const body =
      await req.json()

    const payment_id =
      body.payment_id

    if (!payment_id) {

      return NextResponse.json(
        {
          error: "payment_id_required"
        },
        {
          status: 400
        }
      )
    }

    /* =========================================
       LOAD PAYMENT
    ========================================= */

    const { data: payment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          *,
          orders (*)
        `)
        .eq("id", payment_id)
        .maybeSingle()

    if (!payment) {

      return NextResponse.json(
        {
          error: "payment_not_found"
        },
        {
          status: 404
        }
      )
    }

    if (payment.status === "approved") {

      return NextResponse.json({
        ok: true,
        already_processed: true
      })
    }

    /* =========================================
       CHECK FLOW STATUS
    ========================================= */

    const response = await axios.get(

      `${process.env.FLOW_BASE_URL}/payment/getStatus`,

      {
        params: {

          apiKey:
            process.env.FLOW_API_KEY,

          token:
            payment.provider_payment_id
        }
      }
    )

    const flowPayment =
      response.data

    if (
      flowPayment.status !==
      FLOW_STATUS_APPROVED
    ) {

      return NextResponse.json({
        ok: false,
        flow_status:
          flowPayment.status
      })
    }

    /* =========================================
       APPROVE PAYMENT
    ========================================= */

    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        status: "approved",

        paid_at:
          new Date().toISOString()

      })
      .eq("id", payment.id)

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        status: "paid"

      })
      .eq("id", payment.order_id)

    /* =========================================
       ASSIGN TICKETS
    ========================================= */

    await assignReservedTickets({

      raffle_id:
        payment.raffle_id,

      order_id:
        payment.order_id,

      payment_id:
        payment.id

    })

    /* =========================================
       LEDGER
    ========================================= */

    await processRafflePayment({

      payment_id:
        payment.id,

      raffle_id:
        payment.raffle_id,

      order_id:
        payment.order_id,

      amount:
        Number(payment.amount_clp),

      provider_fee:
        Number(
          flowPayment.fee || 0
        )

    })

    return NextResponse.json({
      ok: true,
      reconciled: true
    })

  } catch (error) {

    console.error(
      "reconcile-payment error",
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