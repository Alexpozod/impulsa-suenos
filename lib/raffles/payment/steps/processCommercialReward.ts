import { PaymentProcessingContext } from "../types"

import {
  processAffiliateCommission as processAffiliate
} from "@/lib/raffles/affiliate/processAffiliateCommission"

import {
  processReferralReward as processReferral
} from "@/lib/raffles/referral/processReferralReward"

export async function processCommercialReward(
  context: PaymentProcessingContext
) {

  if (
    !context.order ||
    !context.payment
  ) {
    return context
  }

  const tracking =
    context.order?.metadata?.tracking ?? {}

  switch (tracking.commercialType) {

    case "affiliate":

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

      break

    case "referral":

      await processReferral(
        context
      )

      break

  }

  return context

}