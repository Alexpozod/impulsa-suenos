import { createClient } from "@supabase/supabase-js"

import { PaymentProcessingContext } from "../types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function buildPaymentContext(
  context: PaymentProcessingContext
): Promise<PaymentProcessingContext> {

  const { data: payment, error: paymentError } =
    await supabase
      .schema("raffles")
      .from("payments")
      .select("*")
      .eq(
        "provider_payment_id",
        context.providerToken
      )
      .maybeSingle()

  if (paymentError) {

    throw paymentError

  }

  if (!payment) {

    return {

      ...context,

      payment: null,

      order: null,

      raffle: null

    }

  }

  const { data: order, error: orderError } =
    await supabase
      .schema("raffles")
      .from("orders")
      .select("*")
      .eq(
        "id",
        payment.order_id
      )
      .maybeSingle()

  if (orderError) {

    throw orderError

  }

  return {

    ...context,

    payment,

    order: order ?? null,

    raffle:
      context.raffle ?? null

  }

}