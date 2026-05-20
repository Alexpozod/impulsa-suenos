import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_CHUNK_SIZE = 10000

interface CreateTicketInventoryParams {
  raffle_id: string
  chunk_size?: number
}

export async function createTicketInventory({
  raffle_id,
  chunk_size = DEFAULT_CHUNK_SIZE
}: CreateTicketInventoryParams) {

  /* =========================================
     LOAD RAFFLE
  ========================================= */

  const { data: raffle, error: raffleError } =
    await supabase
      .schema("raffles")
      .from("raffles")
      .select(`
        id,
        ticket_prefix,
        ticket_min_number,
        ticket_max_number,
        unlimited_tickets
      `)
      .eq("id", raffle_id)
      .maybeSingle()

  if (raffleError || !raffle) {
    throw new Error("raffle_not_found")
  }

  /* =========================================
     CURRENT MAX GENERATED
  ========================================= */

  const { data: lastTicket } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("ticket_number")
      .eq("raffle_id", raffle_id)
      .order("ticket_number", {
        ascending: false
      })
      .limit(1)
      .maybeSingle()

  const startNumber =
    lastTicket?.ticket_number
      ? Number(lastTicket.ticket_number) + 1
      : Number(raffle.ticket_min_number)

  let endNumber =
    startNumber + chunk_size - 1

  /* =========================================
     LIMITED RAFFLES
  ========================================= */

  if (!raffle.unlimited_tickets) {

    const maxAllowed =
      Number(raffle.ticket_max_number)

    if (startNumber > maxAllowed) {
      return {
        created: 0,
        completed: true
      }
    }

    if (endNumber > maxAllowed) {
      endNumber = maxAllowed
    }
  }

  /* =========================================
     BUILD INVENTORY
  ========================================= */

  const inventory = []

  for (
    let number = startNumber;
    number <= endNumber;
    number++
  ) {

    const visibleNumber =
      String(number).padStart(5, "0")

    inventory.push({

      raffle_id,

      ticket_number: number,

      ticket_code:
        `${raffle.ticket_prefix}/${visibleNumber}`,

      status: "available"
    })
  }

  /* =========================================
     INSERT INVENTORY
  ========================================= */

  const { error: insertError } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .insert(inventory)

  if (insertError) {

    console.error(
      "createTicketInventory insert error",
      insertError
    )

    throw new Error(
      "inventory_insert_failed"
    )
  }

  /* =========================================
     UPDATE GENERATED COUNTER
  ========================================= */

  await supabase
    .schema("raffles")
    .from("raffles")
    .update({

      generated_ticket_count:
        endNumber

    })
    .eq("id", raffle_id)

  return {

    created:
      inventory.length,

    start_number:
      startNumber,

    end_number:
      endNumber,

    completed:
      !raffle.unlimited_tickets &&
      endNumber >=
        Number(raffle.ticket_max_number)
  }
}