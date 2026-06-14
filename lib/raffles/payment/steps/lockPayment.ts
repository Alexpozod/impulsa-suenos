import { createClient } from "@supabase/supabase-js"
import { PaymentProcessingContext } from "../types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function lockPayment(
  context: PaymentProcessingContext
) {
  if (!context.payment) {
    throw new Error("payment_not_found")
  }

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("payments")
      .update({
        status: "processing"
      })
      .eq("id", context.payment.id)
      .eq("status", "pending")
      .select()
      .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error(
      "payment_already_processing"
    )
  }

  context.payment = data

  return context
}