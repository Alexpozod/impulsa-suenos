import { PaymentProcessingContext } from "../types"

import {
  processRafflePayment
} from "@/lib/raffles/ledger/processRafflePayment"

export async function createLedger(
  context: PaymentProcessingContext
) {

  if (
    !context.payment ||
    !context.order
  ) {
    return context
  }

  await processRafflePayment({

    payment_id:
      context.payment.id,

    raffle_id:
      context.order.raffle_id,

    order_id:
      context.order.id,

    amount:
      Number(
        context.payment.amount_clp ??
        context.payment.amount ??
        0
      ),

    provider_fee:
      Number(
        context.providerFee ??
        context.payment.provider_fee ??
        0
      )

  })

  return context

}