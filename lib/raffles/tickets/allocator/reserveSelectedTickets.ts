import crypto from "crypto"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESERVATION_MINUTES = 15

export async function reserveSelectedTickets(

  ticketIds: string[],

  orderId: string,

  buyerEmail: string

) {

  const reservationToken =
    crypto.randomUUID()

  const reservedUntil =
    new Date(

      Date.now() +
      RESERVATION_MINUTES *
      60 *
      1000

    ).toISOString()

  const {
    data,
    error
  } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status: "reserved",

        order_id:
          orderId,

        buyer_email:
          buyerEmail,

        reserved_until:
          reservedUntil,

        reservation_token:
          reservationToken

      })
      .in(
        "id",
        ticketIds
      )
      .eq(
        "status",
        "available"
      )
      .select(`
        id,
        ticket_code,
        ticket_number
      `)

  if (error) {

    throw error

  }

  return {

    reservationToken,

    reservedUntil,

    tickets:
      data ?? []

  }

}