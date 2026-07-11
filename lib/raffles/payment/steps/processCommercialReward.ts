import { PaymentProcessingContext } from "../types"

import {
  processAffiliateCommission
} from "@/lib/raffles/affiliate/processAffiliateCommission"

import {
  processReferralReward
} from "@/lib/raffles/referral/processReferralReward"

import {
  calculateCommercialNet
} from "@/lib/raffles/commercial/calculateCommercialNet"

export async function processCommercialReward(

  context: PaymentProcessingContext

) {

  if (

    !context.order ||

    !context.payment

  ) {

    return context

  }

  const commercialType =

    context.order.metadata?.commercialType ??

    context.order.metadata?.quote?.metadata?.commercialType ??

    "none"

    const commercial =
  calculateCommercialNet({

    grossAmount:

      Number(

        context.payment.amount_clp ??

        context.payment.amount ??

        0

      ),

    vatPercent: 19,

    gatewayPercent: 2.95

  })

  switch (commercialType) {

    case "affiliate":

      await processAffiliateCommission({

        payment_id:

          context.payment.id,

        raffle_id:

          context.order.raffle_id,

        order_id:

          context.order.id,

        amount:

            commercial.netCommercialAmount

      })

      break

    case "referral":

      await processReferralReward(

        context

      )

      break

  }

  return context

}