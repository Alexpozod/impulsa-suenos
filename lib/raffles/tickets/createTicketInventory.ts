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

/**
 * Serializes inventory generation in PostgreSQL under a raffle row lock.
 * The unique database indexes remain the final protection against duplicates.
 */
export async function createTicketInventory({
  raffle_id,
  chunk_size = DEFAULT_CHUNK_SIZE
}: CreateTicketInventoryParams) {
  if (!Number.isInteger(chunk_size) || chunk_size < 1 || chunk_size > DEFAULT_CHUNK_SIZE) {
    throw new Error("invalid_inventory_chunk_size")
  }

  const { data, error } = await supabase
    .schema("raffles")
    .rpc("generate_inventory_chunk_atomic", {
      p_raffle_id: raffle_id,
      p_chunk_size: chunk_size
    })

  if (error) {
    console.error("raffles_atomic_inventory_generation_failed", error.code)
    throw new Error("inventory_insert_failed")
  }

  return {
    created: Number(data?.created ?? 0),
    start_number: data?.start_number ?? undefined,
    end_number: data?.end_number ?? undefined,
    completed: Boolean(data?.completed)
  }
}
