import { PaymentProcessingContext } from "../types"

export async function validatePayment(
  context: PaymentProcessingContext
) {

  if (!context.payment) {

    throw new Error(
      "payment_not_found"
    )

  }

  if (!context.order) {

    throw new Error(
      "order_not_found"
    )

  }

  if (!context.raffle) {

    throw new Error(
      "raffle_not_found"
    )

  }

  if (
    context.payment.status === "failed"
  ) {

    throw new Error(
      "payment_failed"
    )

  }

  if (
    context.order.status === "cancelled"
  ) {

    throw new Error(
      "order_cancelled"
    )

  }

  if (
    context.raffle.status !== "active"
  ) {

    throw new Error(
      "raffle_inactive"
    )

  }

  return context

}