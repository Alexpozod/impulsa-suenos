import { PaymentProcessingContext } from "../types"

import {
  trackEvent
} from "@/lib/raffles/analytics/trackEvent"

export async function trackAnalytics(
  context: PaymentProcessingContext
) {

  if (
    !context.payment ||
    !context.order
  ) {
    return context
  }

  try {

    await trackEvent({

      event_type:
        "payment_success",

      raffle_id:
        context.order.raffle_id,

      order_id:
        context.order.id,

      payment_id:
        context.payment.id,

      user_email:
        context.order.buyer_email,

      source:
        context.order.source,

      referrer:
        context.order.referrer,

      utm_source:
        context.order.utm_source,

      utm_medium:
        context.order.utm_medium,

      utm_campaign:
        context.order.utm_campaign,

      ip:
        context.order.ip_address,

      user_agent:
        context.order.user_agent,

      metadata: {

        quantity:
          context.order.quantity,

        amount:
          context.order.total_clp,

        currency:
          context.order.currency,

        provider:
          context.provider

      }

    })

  } catch (error) {

    console.error(
      "TRACK ANALYTICS ERROR",
      error
    )

  }

  return context

}