import {
  PaymentProcessingContext,
  PaymentProcessingResult
} from "./types"

import {
  buildPaymentContext
} from "./context"

import {
  checkExecutionGuard
} from "./guard"

import {
  validatePayment,
  lockPayment,
  approvePayment,
  assignTickets,
  createLedger,
  processAffiliateCommission,
  processReferralReward,
  trackAnalytics,
  sendNotifications,
  finalizePayment
} from "./steps"

export async function processPayment(
  initialContext: PaymentProcessingContext
): Promise<PaymentProcessingResult> {

  let context: any =
  await buildPaymentContext(
    initialContext
  )

  if (!context.payment) {

    return {

      success: true,

      status: "ignored",

      message:
        "payment_not_found"

    }

  }

  const guard =
    await checkExecutionGuard({

      executionKey:
        `${context.provider}:${context.payment.id}`

    })

  if (!guard.allowed) {

    return {

      success: true,

      status: "ignored",

      message:
        guard.reason

    }

  }

  console.log("STEP -> validatePayment")
await validatePayment(context)

console.log("STEP -> lockPayment")
await lockPayment(context)

console.log("STEP -> approvePayment")
await approvePayment(context)

console.log("STEP -> assignTickets")
await assignTickets(context)

console.log("STEP -> createLedger")
await createLedger(context)

console.log("STEP -> processAffiliateCommission")
await processAffiliateCommission(context)

console.log(
  "STEP -> processReferralReward"
)
await processReferralReward(
  context
)

console.log("STEP -> trackAnalytics")
await trackAnalytics(context)

console.log("STEP -> sendNotifications")
await sendNotifications(context)

console.log("STEP -> finalizePayment")
await finalizePayment(context)

console.log(
  "PIPELINE COMPLETED",
  {
    paymentId:
      context.payment?.id,

    orderId:
      context.order?.id,

    raffleId:
      context.raffle?.id,

    tickets:
      context.tickets?.length ?? 0
  }
)

    return {

    success: true,

    status: "completed",

    message: JSON.stringify({

        tickets:
  context.tickets ?? []

    })

}

}