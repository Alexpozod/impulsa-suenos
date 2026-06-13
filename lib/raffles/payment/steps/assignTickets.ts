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

  /*
    Próximamente este step absorberá
    completamente la lógica del webhook.
  */

  if (
    !context.raffleId ||
    !context.orderId ||
    !context.paymentId
  ) {

    return context

  }

  try {

    await assignReservedTickets({

      raffle_id:
        context.raffleId,

      order_id:
        context.orderId,

      payment_id:
        context.paymentId

    })

  }

  catch (error) {

    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        status: "failed"

      })
      .eq(
        "id",
        context.paymentId
      )

    await supabase
      .schema("raffles")
      .from("orders")
      .update({

        status: "cancelled"

      })
      .eq(
        "id",
        context.orderId
      )

    await releaseOrderReservations(

      context.orderId

    )

    throw error

  }

  return context

}