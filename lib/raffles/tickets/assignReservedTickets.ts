import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AssignReservedTicketsParams {
  raffle_id: string
  order_id: string
  payment_id: string
}

export async function assignReservedTickets({
  raffle_id,
  order_id,
  payment_id
}: AssignReservedTicketsParams) {

  /* =========================================
     LOAD RESERVED TICKETS
  ========================================= */

  const { data: reservedTickets, error } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select(`
        id,
        ticket_code,
        ticket_number
      `)
      .eq("raffle_id", raffle_id)
      .eq("order_id", order_id)
      .eq("status", "reserved")

  if (error) {

    console.error(
      "assignReservedTickets select error",
      error
    )

    throw new Error(
      "reserved_tickets_select_failed"
    )
  }

  if (
    !reservedTickets ||
    reservedTickets.length === 0
  ) {

    throw new Error(
      "reserved_tickets_not_found"
    )
  }

  const ticketIds =
    reservedTickets.map(
      t => t.id
    )

  /* =========================================
     MARK AS PAID
  ========================================= */

  const { error: updateError } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status: "paid",

        payment_id,

        reserved_until: null

      })
      .in("id", ticketIds)
      .eq("status", "reserved")

  if (updateError) {

    console.error(
      "assignReservedTickets update error",
      updateError
    )

    throw new Error(
      "ticket_assignment_failed"
    )
  }

  /* =========================================
     CREATE OWNERSHIP RECORDS
  ========================================= */

  const ownershipRows =
    ticketIds.map(ticket_id => ({

      order_id,

      ticket_id

    }))

  const { error: ownershipError } =
    await supabase
      .schema("raffles")
      .from("order_tickets")
      .insert(ownershipRows)

  if (ownershipError) {

    console.error(
      "assignReservedTickets ownership error",
      ownershipError
    )

    throw new Error(
      "ticket_ownership_creation_failed"
    )
  }

  /* =========================================
     UPDATE COUNTERS
  ========================================= */

  const quantity =
    reservedTickets.length

  await supabase
    .schema("raffles")
    .from("raffles")
    .update({

      sold_ticket_count:
        supabase.rpc as any,

      reserved_ticket_count:
        supabase.rpc as any

    })
    .eq("id", raffle_id)

  return reservedTickets
}