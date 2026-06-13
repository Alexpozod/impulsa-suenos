import { ensureTicketInventory }
from "./ensureTicketInventory"

import { recalculateRaffleCounters }
from "./recalculateRaffleCounters"

import { allocateTickets }
from "./allocator"

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

  /* =========================================
     ALLOCATION ENGINE
  ========================================= */

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
     RECALCULATE COUNTERS
  ========================================= */

  await recalculateRaffleCounters({

    raffle_id

  })

  /* =========================================
     RETURN COMPATIBLE FORMAT
  ========================================= */

  return allocation.tickets.map(

    ticket => ({

      id:
        ticket.id,

      ticket_code:
        ticket.ticketCode,

      ticket_number:
        ticket.ticketNumber

    })

  )

}