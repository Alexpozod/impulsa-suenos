import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

interface TrackEventInput {

  event_type: string

  raffle_id?: string

  order_id?: string

  payment_id?: string

  user_email?: string

  source?: string
  referrer?: string

  utm_source?: string
  utm_medium?: string
  utm_campaign?: string

  ip?: string
  user_agent?: string

  metadata?: any
}

export async function trackEvent({

  event_type,

  raffle_id,
  order_id,
  payment_id,

  user_email,

  source,
  referrer,

  utm_source,
  utm_medium,
  utm_campaign,

  ip,
  user_agent,

  metadata = {}

}: TrackEventInput) {

  try {

    const { error } =
  await supabase
    .schema("raffles")
    .from("analytics_events")
    .insert({

      event_type,

      raffle_id,
      order_id,
      payment_id,

      user_email,

      source,
      referrer,

      utm_source,
      utm_medium,
      utm_campaign,

      ip_address: ip,
      
      user_agent,

      metadata

    })

if (error) {

  console.error(
    "ANALYTICS INSERT ERROR",
    error
  )

}

  } catch (error) {

    console.error(
      "raffle analytics error",
      error
    )
  }
}