import { createClient } from "@supabase/supabase-js"

import { PaymentProcessingContext } from "../types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function buildPaymentContext(

  context: PaymentProcessingContext

): Promise<PaymentProcessingContext> {

  const { data: payment, error } =
    await supabase
      .schema("raffles")
      .from("payments")
      .select("*")
      .eq(
        "provider_payment_id",
        context.providerToken
      )
      .maybeSingle()

  if (error) {

    throw error

  }

  return {

    ...context,

    payment:
      payment ?? null,

    order:
      context.order ?? null,

    raffle:
      context.raffle ?? null

  }

}