import { createClient } from "@supabase/supabase-js"
import { PaymentProcessingContext } from "../types"
import { recalculateRaffleCounters } from "@/lib/raffles/tickets/recalculateRaffleCounters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function assignTickets(context: PaymentProcessingContext) {
  if (!context.payment || !context.order) throw new Error("payment_or_order_not_found")

  const raffleId = context.raffleId ?? context.payment.raffle_id
  const orderId = context.orderId ?? context.payment.order_id
  const paymentId = context.payment.id

  if (!raffleId || !orderId || !paymentId) throw new Error("payment_context_incomplete")

  // PostgreSQL atomically confirms ticket ownership, order and payment status.
  // Never mark a Flow-approved payment as failed or cancel its order on errors.
  const { data, error } = await supabase.schema("raffles")
    .rpc("confirm_reserved_purchase_atomic", {
      p_payment_id: paymentId,
      p_order_id: orderId,
      p_raffle_id: raffleId
    })

  if (error) {
    console.error("raffles_atomic_payment_confirmation_failed", error.code)
    throw new Error("ticket_confirmation_requires_reconciliation")
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("payment_has_no_confirmed_tickets")
  }

  context.tickets = data.map(ticket => ({
    id: ticket.ticket_id,
    ticket_code: ticket.ticket_code,
    ticket_number: Number(ticket.ticket_number)
  }))

  await recalculateRaffleCounters({ raffle_id: raffleId })
  return context
}
