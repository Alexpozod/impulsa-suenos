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
        raffle_id,
        order_id
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
      released: 0,
      expiredOrders: 0
    }
  }

  const ticketIds =
    expiredTickets.map(
      ticket => ticket.id
    )

  const orderIds =
    [...new Set(
      expiredTickets
        .map(
          ticket => ticket.order_id
        )
        .filter(
          (
            orderId
          ): orderId is string =>
            typeof orderId === "string" &&
            orderId.length > 0
        )
    )]

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

        buyer_email: null,

        reservation_token: null

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
     EXPIRE ASSOCIATED ORDERS
  ========================================= */

  let expiredOrders = 0

  if (orderIds.length > 0) {

    const {
      data: updatedOrders,
      error: orderUpdateError
    } =
      await supabase
        .schema("raffles")
        .from("orders")
        .update({
          status: "expired",
          updated_at:
            new Date().toISOString()
        })
        .in("id", orderIds)
        .eq("status", "pending")
        .select("id")

    if (orderUpdateError) {

      console.error(
        "releaseExpiredReservations order update error",
        orderUpdateError
      )

      throw new Error(
        "expired_orders_update_failed"
      )
    }

    expiredOrders =
      updatedOrders?.length ?? 0
  }

  /* =========================================
     RECALCULATE COUNTERS
  ========================================= */

  const raffleIds =
    [...new Set(
      expiredTickets.map(
        ticket => ticket.raffle_id
      )
    )]

  for (const raffleId of raffleIds) {

    await recalculateRaffleCounters({
      raffle_id: raffleId
    })
  }

  console.log(
    "EXPIRED RESERVATIONS RELEASED",
    {
      releasedTickets:
        expiredTickets.length,

      expiredOrders
    }
  )

  return {

    released:
      expiredTickets.length,

    expiredOrders

  }
}