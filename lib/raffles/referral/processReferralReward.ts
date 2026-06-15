import {
  resolveReferralReward
} from "./resolveReferralReward"

import {
  buildReferralLedgerEntry
} from "./buildReferralLedgerEntry"

import {
  insertReferralLedgerEntry
} from "./insertReferralLedgerEntry"

import {
  PaymentProcessingContext
} from "@/lib/raffles/payment/types"

export async function processReferralReward(

  context: PaymentProcessingContext

){

  try{

    if(

      !context.order ||

      !context.payment

    ){

      return context

    }

    const commission =

      await resolveReferralReward(

        context.order.id,

        Number(
          context.order.total_clp || 0
        )

      )

    if(!commission){

      return context

    }

    if(

      commission.calculation.rewardAmount <= 0

    ){

      return context

    }

    const ledgerEntry =

      buildReferralLedgerEntry({

        raffle_id:

          context.order.raffle_id,

        order_id:

          context.order.id,

        payment_id:

          context.payment.id,

        referral_id:

          commission.referral.id,

        referral_code:

          commission.referral.code,

        reward_amount:

          commission.calculation.rewardAmount

      })

    await insertReferralLedgerEntry(

      ledgerEntry

    )

  }

  catch(error){

    console.error(

      "processReferralReward",

      error

    )

  }

  return context

}