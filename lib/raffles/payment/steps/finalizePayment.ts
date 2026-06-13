import { PaymentProcessingContext } from "../types"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function finalizePayment(
  context: PaymentProcessingContext
) {

  if (!context.payment) {
    return context
  }

  try {

    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        processed_at:
          new Date().toISOString()

      })
      .eq(
        "id",
        context.payment.id
      )

  } catch (error) {

    console.error(
      "FINALIZE PAYMENT ERROR",
      error
    )

  }

  return context

}