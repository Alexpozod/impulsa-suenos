import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RecalculateRaffleCountersParams {
  raffle_id: string
}

export async function recalculateRaffleCounters({
  raffle_id
}: RecalculateRaffleCountersParams) {

  /* =========================================
     GENERATED
  ========================================= */

  const { count: generatedCount } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("raffle_id", raffle_id)

  /* =========================================
     SOLD
  ========================================= */

  const paidResult =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("raffle_id", raffle_id)
    .eq("status", "paid")

const winnerResult =
  await supabase
    .schema("raffles")
    .from("ticket_inventory")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("raffle_id", raffle_id)
    .eq("status", "winner")

const soldCount =
  (paidResult.count || 0) +
  (winnerResult.count || 0)

  /* =========================================
     RESERVED
  ========================================= */

  const { count: reservedCount } =
    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("raffle_id", raffle_id)
      .eq("status", "reserved")

  /* =========================================
     UPDATE RAFFLE
  ========================================= */

  const { error } =
    await supabase
      .schema("raffles")
      .from("raffles")
      .update({

        generated_ticket_count:
          generatedCount || 0,

        sold_ticket_count:
          soldCount || 0,

        reserved_ticket_count:
          reservedCount || 0

      })
      .eq("id", raffle_id)

  if (error) {

    console.error(
      "recalculateRaffleCounters error",
      error
    )

    throw new Error(
      "raffle_counter_recalculation_failed"
    )
  }

  return {

    generated:
      generatedCount || 0,

    sold:
      soldCount || 0,

    reserved:
      reservedCount || 0
  }
}