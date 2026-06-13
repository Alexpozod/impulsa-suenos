import {
  PaymentProcessingContext,
  PaymentProcessingResult
} from "./types"

import {
  buildPaymentContext
} from "./context"

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

  let context = initialContext

  context = await buildPaymentContext(
    context
  )

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