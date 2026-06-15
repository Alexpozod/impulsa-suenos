import { PaymentProcessingContext }
from "../types"

import {
  processReferralReward as processReferral
}
from "@/lib/raffles/referral/processReferralReward"

export async function processReferralReward(

  context: PaymentProcessingContext

) {

  await processReferral(
    context
  )

  return context

}