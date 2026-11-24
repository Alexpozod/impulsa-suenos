import { createClient } from "@supabase/supabase-js"

import {
  AllocateTicketsInput,
  AllocateTicketsResult
} from "./types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Selection and reservation happen in one PostgreSQL transaction.
 * SKIP LOCKED avoids assigning a ticket already claimed by another checkout.
 */
export async function allocateTickets(
  input: AllocateTicketsInput
): Promise<AllocateTicketsResult> {
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 1000) {
    throw new Error("invalid_ticket_quantity")
  }

  const { data, error } = await supabase
    .schema("raffles")
    .rpc("reserve_tickets_atomic", {
      p_raffle_id: input.raffleId,
      p_order_id: input.orderId,
      p_buyer_email: input.buyerEmail,
      p_quantity: input.quantity
    })

  if (error) {
    // Keep private database details out of API responses and logs.
    console.error("raffles_atomic_ticket_reservation_failed", error.code)
    throw new Error(
      error.message?.includes("not_enough_tickets_available")
        ? "not_enough_tickets_available"
        : "reservation_failed"
    )
  }

  if (!Array.isArray(data) || data.length !== input.quantity) {
    throw new Error("reservation_quantity_mismatch")
  }

  const token = data[0]?.reservation_token
  const reservedUntil = data[0]?.reserved_until

  if (!token || !reservedUntil || data.some(t => t.reservation_token !== token)) {
    throw new Error("reservation_metadata_invalid")
  }

  return {
    reservationToken: token,
    reservedUntil,
    tickets: data.map(t => ({
      id: t.ticket_id,
      ticketCode: t.ticket_code,
      ticketNumber: Number(t.ticket_number)
    }))
  }
}
