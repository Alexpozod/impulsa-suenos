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
  const { data, error } = await supabase.schema("raffles")
    .rpc("recalculate_raffle_counters_atomic", { p_raffle_id: raffle_id })

  if (error || !data) {
    console.error("raffles_atomic_counter_recalculation_failed", error?.code)
    throw new Error("raffle_counter_recalculation_failed")
  }

  return {
    generated: Number(data.generated ?? 0),
    sold: Number(data.sold ?? 0),
    reserved: Number(data.reserved ?? 0)
  }
}
