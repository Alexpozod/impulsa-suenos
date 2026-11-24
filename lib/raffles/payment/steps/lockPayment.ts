import { createClient } from "@supabase/supabase-js"
import { PaymentProcessingContext } from "../types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function lockPayment(context: PaymentProcessingContext) {
  if (!context.payment) throw new Error("payment_not_found")

  // A previous attempt may have committed tickets but failed in a later step.
  if (context.payment.status === "approved" && !context.payment.processed_at) {
    return context
  }

  let query = supabase.schema("raffles").from("payments")
    .update({ status: "processing" })
    .eq("id", context.payment.id)

  if (context.payment.status === "processing") {
    query = query.eq("status", "processing")
      .lt("updated_at", new Date(Date.now() - 5 * 60_000).toISOString())
  } else {
    query = query.eq("status", "pending")
  }

  const { data, error } = await query.select().maybeSingle()
  if (error) throw error
  if (!data) throw new Error("payment_already_processing")
  context.payment = data
  return context
}
