import { PaymentProcessingContext } from "../types"

import {
  processAffiliateCommission as processAffiliate
} from "@/lib/raffles/affiliate/processAffiliateCommission"

export async function processAffiliateCommission(
  context: PaymentProcessingContext
) {

  if (
    !context.payment ||
    !context.order
  ) {
    return context
  }

  try {

    await processAffiliate({

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
        )

    })

  } catch (error) {

    console.error(
      "AFFILIATE COMMISSION ERROR",
      error
    )

  }

  return context

}