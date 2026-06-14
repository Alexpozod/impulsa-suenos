import { PaymentProcessingContext } from "../types"

import {
  assignReservedTickets
} from "@/lib/raffles/tickets/assignReservedTickets"

import {
  releaseOrderReservations
} from "@/lib/raffles/tickets/releaseOrderReservations"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function assignTickets(
  context: PaymentProcessingContext
) {

  if (!context.payment) {
    throw new Error(
      "payment_not_found"
    )
  }

  const raffleId =
    context.raffleId ??
    context.payment.raffle_id

  const orderId =
    context.orderId ??
    context.payment.order_id

  const paymentId =
    context.payment.id

  if (
    !raffleId ||
    !orderId ||
    !paymentId
  ) {
    return context
  }

  try {

    const tickets =
  await assignReservedTickets({

    raffle_id:
      raffleId,

    order_id:
      orderId,

    payment_id:
      paymentId

  })

context.tickets =
  tickets

  } catch (error) {

    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        status: "failed"

      })
      .eq(
        "id",
        paymentId
      )

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        status: "cancelled"

      })
      .eq(
        "id",
        orderId
      )

    await releaseOrderReservations(
      orderId
    )

    throw error

  }

  return context

}