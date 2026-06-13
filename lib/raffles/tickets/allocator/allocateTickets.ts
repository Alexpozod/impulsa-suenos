import {
  AllocateTicketsInput,
  AllocateTicketsResult
} from "./types"

import { selectAvailableTickets }
from "./selectAvailableTickets"

import { reserveSelectedTickets }
from "./reserveSelectedTickets"

export async function allocateTickets(

  input: AllocateTicketsInput

): Promise<AllocateTicketsResult> {

  const availableTickets =

    await selectAvailableTickets(

      input.raffleId,

      input.quantity

    )

  if (

    availableTickets.length <

    input.quantity

  ) {

    throw new Error(

      "not_enough_tickets_available"

    )

  }

  const reservation =

    await reserveSelectedTickets(

      availableTickets.map(

        t => t.id

      ),

      input.orderId,

      input.buyerEmail

    )

  return reservation

}