import {
  PaymentProcessingContext,
  PaymentProcessingResult
} from "./types"

import {
  validatePayment,
  lockPayment,
  approvePayment
} from "./steps"

export async function processPayment(
  context: PaymentProcessingContext
): Promise<PaymentProcessingResult> {

  await validatePayment(context)

  await lockPayment(context)

  await approvePayment(context)

  return {

    success: true,

    status: "pending"

  }

}