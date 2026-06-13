import {
  PaymentProcessingContext,
  PaymentProcessingResult
} from "./types"

import {
  validatePayment,
  lockPayment,
  approvePayment,
  assignTickets
} from "./steps"

export async function processPayment(
  context: PaymentProcessingContext
): Promise<PaymentProcessingResult> {

  await validatePayment(context)

  await lockPayment(context)

  await approvePayment(context)

  await assignTickets(context)

  return {

    success: true,

    status: "pending"

  }

}