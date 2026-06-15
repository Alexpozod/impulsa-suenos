import {
  PaymentProcessingContext
} from "@/lib/raffles/payment/types"

export async function processReferralReward(

  context: PaymentProcessingContext

) {

  try {

    console.log(

      "PROCESS_REFERRAL_REWARD",

      {

        orderId:
          context.order?.id,

        paymentId:
          context.payment?.id,

        referralCode:

          context.order?.metadata?.tracking
            ?.referralCode ?? null

      }

    )

  }

  catch (error) {

    console.error(

      "processReferralReward",

      error

    )

  }

  return context

}