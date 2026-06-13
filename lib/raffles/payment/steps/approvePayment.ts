import { createClient } from "@supabase/supabase-js"

import { PaymentProcessingContext } from "../types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function approvePayment(
  context: PaymentProcessingContext
) {

  if (!context.payment) {

    throw new Error(
      "payment_not_found"
    )

  }

  const { error: paymentError } =
    await supabase
      .schema("raffles")
      .from("payments")
      .update({

        status: "approved"

      })
      .eq(
        "id",
        context.payment.id
      )

  if (paymentError) {

    throw paymentError

  }

  if (context.payment.order_id) {

    const { error: orderError } =
      await supabase
        .schema("raffles")
        .from("orders")
        .update({

          status: "paid"

        })
        .eq(
          "id",
          context.payment.order_id
        )

    if (orderError) {

      throw orderError

    }

  }

  return context

}