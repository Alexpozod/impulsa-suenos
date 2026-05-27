import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { releaseOrderReservations }
from "@/lib/raffles/tickets/releaseOrderReservations"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function POST(
  req: Request
) {

  try {

    /* =========================
       INTERNAL AUTH
    ========================= */

    const authHeader =
      req.headers.get(
        "authorization"
      )

    if (
      authHeader !==
      `Bearer ${process.env.RAFFLES_INTERNAL_API_KEY}`
    ) {

      return NextResponse.json(
        {
          error:
            "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    /* =========================
       FIND STUCK PAYMENTS
    ========================= */

    const stuckDate =
      new Date(
        Date.now() -
        15 * 60 * 1000
      ).toISOString()

    const {
      data: stuckPayments
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          id,
          order_id,
          raffle_id,
          status,
          created_at
        `)
        .eq(
          "status",
          "processing"
        )
        .lte(
          "created_at",
          stuckDate
        )

    const repaired: any[] = []

    for (
      const payment of
      stuckPayments || []
    ) {

      /* =========================
         MARK PAYMENT FAILED
      ========================= */

      await supabase
        .schema("raffles")
        .from("payments")
        .update({

          status:
            "failed"

        })
        .eq(
          "id",
          payment.id
        )

      /* =========================
         CANCEL ORDER
      ========================= */

      await supabase
        .schema("raffles")
        .from("orders")
        .update({

          status:
            "cancelled"

        })
        .eq(
          "id",
          payment.order_id
        )

      /* =========================
         RELEASE TICKETS
      ========================= */

      await releaseOrderReservations(
        payment.order_id
      )

      repaired.push({

        payment_id:
          payment.id,

        order_id:
          payment.order_id

      })

    }

    return NextResponse.json({

      ok: true,

      repaired_count:
        repaired.length,

      repaired

    })

  } catch (error) {

    console.error(
      "repair stuck payments error",
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