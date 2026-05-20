import { createClient } from "@supabase/supabase-js"

import { recalculateRaffleCounters }
from "./recalculateRaffleCounters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function releaseExpiredReservations() {

  /* =========================================
     FIND EXPIRED RESERVATIONS
  ========================================= */

  const now =
    new Date().toISOString()

  const { data: expiredTickets, error } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        raffle_id
      `)
      .eq("status", "reserved")
      .lt("reserved_until", now)

  if (error) {

    console.error(
      "releaseExpiredReservations select error",
      error
    )

    throw new Error(
      "expired_reservations_select_failed"
    )
  }

  if (
    !expiredTickets ||
    expiredTickets.length === 0
  ) {

    return {
      released: 0
    }
  }

  const ticketIds =
    expiredTickets.map(
      t => t.id
    )

  /* =========================================
     RELEASE INVENTORY
  ========================================= */

  const { error: updateError } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status: "available",

        reserved_until: null,

        order_id: null,

        buyer_email: null

      })
      .in("id", ticketIds)
      .eq("status", "reserved")

  if (updateError) {

    console.error(
      "releaseExpiredReservations update error",
      updateError
    )

    throw new Error(
      "expired_reservations_release_failed"
    )
  }

  /* =========================================
     RECALCULATE COUNTERS
  ========================================= */

  const raffleIds =
    [...new Set(
      expiredTickets.map(
        t => t.raffle_id
      )
    )]

  for (const raffleId of raffleIds) {

    await recalculateRaffleCounters({
      raffle_id: raffleId
    })
  }

  return {

    released:
      expiredTickets.length
  }
}