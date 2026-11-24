import { createClient } from "@supabase/supabase-js"
import { recalculateRaffleCounters } from "./recalculateRaffleCounters"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function releaseExpiredReservations() {
  // Expire only orders with no approved or actively processing Flow payment.
  // PostgreSQL locks payment, order and ticket records within one transaction.
  const { data, error } = await supabase.schema("raffles")
    .rpc("expire_reservations_atomic", { p_max_orders: 100 })

  if (error || !data) {
    console.error("raffles_atomic_expiry_failed", error?.code)
    throw new Error("expired_reservations_release_failed")
  }

  const raffleIds: string[] = Array.isArray(data.raffle_ids)
    ? data.raffle_ids : []
  for (const raffleId of raffleIds) {
    await recalculateRaffleCounters({ raffle_id: raffleId })
  }

  return {
    released: Number(data.released ?? 0),
    expiredOrders: Number(data.expiredOrders ?? 0)
  }
}
