import crypto from "crypto"

import { createClient } from "@supabase/supabase-js"

import { recalculateRaffleCounters }
from "./recalculateRaffleCounters"

import { ensureTicketInventory }
from "./ensureTicketInventory"

import { allocateTickets }
from "./allocator"

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
     ENSURE INVENTORY
  ========================================= */

  await ensureTicketInventory(
    raffle_id
  )

/*
==================================
NEW ALLOCATION ENGINE
==================================
*/

const allocation =
  await allocateTickets({

    raffleId:
      raffle_id,

    quantity,

    orderId:
      order_id,

    buyerEmail:
      buyer_email

  })

  /* =========================================
     RESERVATION TOKEN
  ========================================= */

  const reservationToken =
    crypto.randomUUID()

  /* =========================================
     RESERVATION EXPIRATION
  ========================================= */

  const reservedUntil = new Date(
    Date.now() +
    RESERVATION_MINUTES * 60 * 1000
  ).toISOString()

  /* =========================================
   LOAD AVAILABLE TICKETS
========================================= */

const { data: availableTickets, error } =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select(`
      id
    `)
    .eq("raffle_id", raffle_id)
    .eq("status", "available")
    .order(
      "ticket_number",
      {
        ascending: true
      }
    )
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
     RESERVE INVENTORY
  ========================================= */

  const {
  data: reservedUpdate,
  error: updateError
} =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .update({

      status: "reserved",

      order_id,

      buyer_email,

      reserved_until:
        reservedUntil,

      reservation_token:
        reservationToken

    })
    .in("id", ticketIds)
    .eq("status", "available")
    .select("id")

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
   VERIFY UPDATED ROWS
========================================= */

const { count: reservedCount } =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq(
      "reservation_token",
      reservationToken
    )

if (
  (reservedCount || 0) !== quantity
) {

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
    .eq(
      "reservation_token",
      reservationToken
    )

  throw new Error(
    "reservation_race_condition"
  )
}

/* =========================================
   VERIFY ATOMIC RESERVATION
========================================= */

if (
  !reservedUpdate ||
  reservedUpdate.length !== quantity
) {

  console.error(
    "reserveTickets partial reservation",
    {
      expected: quantity,
      reserved:
        reservedUpdate?.length || 0
    }
  )

  throw new Error(
    "inventory_race_condition"
  )
}

  /* =========================================
     VERIFY OWNERSHIP
  ========================================= */

  const { data: reservedTickets } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        ticket_code,
        ticket_number
      `)
      .eq(
        "reservation_token",
        reservationToken
      )

  if (
    !reservedTickets ||
    reservedTickets.length !== quantity
  ) {

    throw new Error(
      "reservation_conflict"
    )
  }

  /* =========================================
     RECALCULATE COUNTERS
  ========================================= */

console.log(
  "ALLOCATION_ENGINE_RESULT",
  allocation
)

  await recalculateRaffleCounters({
    raffle_id
  })

  return reservedTickets
}