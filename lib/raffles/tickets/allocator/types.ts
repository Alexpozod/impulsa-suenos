export interface AllocateTicketsInput {

  raffleId: string

  quantity: number

  orderId: string

  buyerEmail: string

}

export interface AllocatedTicket {

  id: string

  ticketCode: string

  ticketNumber: number

}

export interface AllocateTicketsResult {

  reservationToken: string

  reservedUntil: string

  tickets: AllocatedTicket[]

}