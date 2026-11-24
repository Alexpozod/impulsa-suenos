import { createClient } from "@supabase/supabase-js"
import { recalculateRaffleCounters } from "./recalculateRaffleCounters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function releaseOrderReservations(order_id: string) {
  // Cannot release inventory if a payment is being confirmed or is approved.
  const { data, error } = await supabase.schema("raffles")
    .rpc("release_order_reservations_atomic", { p_order_id: order_id })

  if (error || !data) {
    console.error("raffles_atomic_order_release_failed", error?.code)
    throw new Error("release_order_reservations_failed")
  }

  if (Number(data.released ?? 0) > 0 && data.raffle_id) {
    await recalculateRaffleCounters({ raffle_id: data.raffle_id })
  }
}
