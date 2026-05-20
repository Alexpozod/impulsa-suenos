import { createClient } from "@supabase/supabase-js"

import { recalculateRaffleCounters }
from "./recalculateRaffleCounters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function releaseOrderReservations(
  order_id: string
) {

  /* =========================================
     LOAD RESERVED TICKETS
  ========================================= */

  const { data: tickets, error } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        raffle_id
      `)
      .eq("order_id", order_id)
      .eq("status", "reserved")

  if (error) {

    console.error(
      "releaseOrderReservations select error",
      error
    )

    throw new Error(
      "release_order_reservations_failed"
    )
  }

  if (!tickets || tickets.length === 0) {
    return
  }

  const ticketIds =
    tickets.map(
      t => t.id
    )

  /* =========================================
     RELEASE INVENTORY
  ========================================= */

  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .update({

      status: "available",

      order_id: null,

      buyer_email: null,

      reserved_until: null,

      reservation_token: null

    })
    .in("id", ticketIds)

  /* =========================================
     RECALCULATE COUNTERS
  ========================================= */

  const raffleIds =
    [...new Set(
      tickets.map(
        t => t.raffle_id
      )
    )]

  for (const raffleId of raffleIds) {

    await recalculateRaffleCounters({
      raffle_id: raffleId
    })
  }
}