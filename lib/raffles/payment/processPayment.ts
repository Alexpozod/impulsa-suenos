import {
  PaymentProcessingContext,
  PaymentProcessingResult
} from "./types"

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
  context: PaymentProcessingContext
): Promise<PaymentProcessingResult> {

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