import { createClient } from "@supabase/supabase-js"

import { recalculateRaffleCounters }
from "./recalculateRaffleCounters"

import { ensureTicketInventory }
from "./ensureTicketInventory"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESERVATION_MINUTES = 15

interface ReserveTicketsParams {
  raffle_id: string
  order_id: string
  buyer_email: string
  quantity: number
}

export async function reserveTickets({
  raffle_id,
  order_id,
  buyer_email,
  quantity
}: ReserveTicketsParams) {

  /* =========================================
     RESERVATION EXPIRATION
  ========================================= */

  const reservedUntil = new Date(
    Date.now() +
    RESERVATION_MINUTES * 60 * 1000
  ).toISOString()

await ensureTicketInventory(
  raffle_id
)

  /* =========================================
     LOAD AVAILABLE TICKETS
  ========================================= */

  const { data: availableTickets, error } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        ticket_code,
        ticket_number
      `)
      .eq("raffle_id", raffle_id)
      .eq("status", "available")
      .limit(quantity)

  if (error) {

    console.error(
      "reserveTickets select error",
      error
    )

    throw new Error(
      "inventory_select_failed"
    )
  }

  if (
    !availableTickets ||
    availableTickets.length < quantity
  ) {

    throw new Error(
      "not_enough_tickets_available"
    )
  }

  const ticketIds =
    availableTickets.map(
      t => t.id
    )

  /* =========================================
     RESERVE TICKETS
  ========================================= */

  const { error: updateError } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status: "reserved",

        order_id,

        buyer_email,

        reserved_until:
          reservedUntil

      })
      .in("id", ticketIds)
      .eq("status", "available")

  if (updateError) {

    console.error(
      "reserveTickets update error",
      updateError
    )

    throw new Error(
      "inventory_reservation_failed"
    )
  }

  /* =========================================
     RECALCULATE COUNTERS
  ========================================= */

  await recalculateRaffleCounters({
    raffle_id
  })

  return availableTickets
}