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
  trackAnalytics,
  sendNotifications,
  finalizePayment
} from "./steps"

export async function processPayment(
  initialContext: PaymentProcessingContext
): Promise<PaymentProcessingResult> {

  let context =
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

  await validatePayment(context)

  await lockPayment(context)

  await approvePayment(context)

  await assignTickets(context)

  await createLedger(context)

  await processAffiliateCommission(context)

  await trackAnalytics(context)

  await sendNotifications(context)

  await finalizePayment(context)

  return {

    success: true,

    status: "completed"

  }

}