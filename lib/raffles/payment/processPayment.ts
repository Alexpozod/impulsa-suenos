import {

  PaymentProcessingContext,
  PaymentProcessingResult

} from "./types"

export async function processPayment(

  context: PaymentProcessingContext

): Promise<PaymentProcessingResult> {

  return {

    success: true,

    status: "pending"

  }

}