import { createClient } from "@supabase/supabase-js"

import { createTicketInventory }
from "./createTicketInventory"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const INVENTORY_THRESHOLD = 1000

export async function ensureTicketInventory(
  raffle_id: string
) {

  /* =========================================
     LOAD RAFFLE
  ========================================= */

  const { data: raffle, error } =
    await supabase
      .schema("raffles")
      .from("raffles")
      .select(`
        id,
        unlimited_tickets,
        status
      `)
      .eq("id", raffle_id)
      .maybeSingle()

  if (error || !raffle) {

    throw new Error(
      "raffle_not_found"
    )
  }

  if (raffle.status !== "active") {

    return
  }

  /* =========================================
     COUNT AVAILABLE
  ========================================= */

  const { count: availableCount } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("raffle_id", raffle_id)
      .eq("status", "available")

  /* =========================================
     THRESHOLD CHECK
  ========================================= */

  if (
    (availableCount || 0) >=
    INVENTORY_THRESHOLD
  ) {

    return
  }

  /* =========================================
     GENERATE NEXT CHUNK
  ========================================= */

  await createTicketInventory({
    raffle_id
  })
}