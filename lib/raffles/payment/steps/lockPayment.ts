import { PaymentProcessingContext } from "../types"

export async function lockPayment(
  context: PaymentProcessingContext
) {

  if (!context.payment) {

    throw new Error(
      "payment_not_found"
    )

  }

  const status =
    context.payment.status

  if (

    status === "approved"

  ) {

    throw new Error(
      "payment_already_processed"
    )

  }

  if (

    status === "processing"

  ) {

    throw new Error(
      "payment_already_processing"
    )

  }

  return context

}