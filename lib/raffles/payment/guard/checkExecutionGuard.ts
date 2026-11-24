import { createClient } from "@supabase/supabase-js"
import { ExecutionGuardContext, ExecutionGuardResult } from "./types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkExecutionGuard(
  context: ExecutionGuardContext
): Promise<ExecutionGuardResult> {
  const paymentId = context.executionKey.split(":")[1]

  const { data, error } = await supabase
    .schema("raffles").from("payments")
    .select("status,processed_at,updated_at")
    .eq("id", paymentId).maybeSingle()

  if (error) throw error
  if (!data) return { allowed: true }

  if (data.status === "approved" && data.processed_at) {
    return { allowed: false, reason: "already_processed" }
  }
  if (data.status === "approved") return { allowed: true }

  if (data.status === "processing") {
    const lastUpdated = data.updated_at ? new Date(data.updated_at).getTime() : NaN
    if (Number.isFinite(lastUpdated) && lastUpdated < Date.now() - 5 * 60_000) {
      return { allowed: true }
    }
    return { allowed: false, reason: "already_processing" }
  }

  if (data.status === "failed" || data.status === "refunded") {
    return { allowed: false, reason: "terminal_payment_state" }
  }
  return { allowed: true }
}
