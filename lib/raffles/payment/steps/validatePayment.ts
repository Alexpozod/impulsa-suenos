import { PaymentProcessingContext } from "../types"

export async function validatePayment(context: PaymentProcessingContext) {
  if (!context.payment) throw new Error("payment_not_found")
  if (!context.order) throw new Error("order_not_found")
  if (!context.raffle) throw new Error("raffle_not_found")
  if (context.payment.status === "failed" || context.payment.status === "refunded") {
    throw new Error("payment_terminal")
  }
  if (context.order.status === "cancelled" || context.order.status === "expired") {
    throw new Error("order_not_fulfillable")
  }
  // A previously approved transaction may be retried after a raffle closes.
  if (context.payment.status !== "approved" && context.raffle.status !== "active") {
    throw new Error("raffle_inactive")
  }
  return context
}
