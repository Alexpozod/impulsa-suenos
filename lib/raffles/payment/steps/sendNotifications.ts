import { PaymentProcessingContext } from "../types"

import {
  sendRaffleConfirmationEmail
} from "@/lib/raffles/emails/sendRaffleConfirmationEmail"

import {
  sendTicketsEmail
} from "@/lib/raffles/emails/sendTicketsEmail"

import {
  getResourcesForQuantity
} from "@/lib/raffles/purchase-resources"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function sendNotifications(
  context: PaymentProcessingContext
) {

  if (
    !context.order ||
    !context.raffle
  ) {

    return context

  }

  try {

    if (
      !context.order.confirmation_email_sent
    ) {

      await sendRaffleConfirmationEmail(
        context.order.id
      )

      await supabase
        .schema("raffles")
        .from("orders")
        .update({

          confirmation_email_sent: true,

          confirmation_email_sent_at:
            new Date().toISOString()

        })
        .eq(
          "id",
          context.order.id
        )

    }

  } catch (error) {

    console.error(
      "CONFIRMATION EMAIL ERROR",
      error
    )

  }

  try {

    if (
  context.order.buyer_email
) {

  const digitalResources =
    await getResourcesForQuantity(
      context.order.quantity
    )

  await sendTicketsEmail({

    email:
      context.order.buyer_email,

    raffleTitle:
      context.raffle.title ||
      "Sorteo",

    tickets:
      context.tickets ?? [],

    digitalResources

  })

}

  } catch (error) {

    console.error(
      "SEND TICKETS EMAIL ERROR",
      error
    )

  }

  return context

}