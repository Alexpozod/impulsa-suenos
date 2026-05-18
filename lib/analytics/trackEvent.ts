import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type TrackEventInput = {
  event_type: string

  campaign_id?: string | null
  payment_id?: string | null

  session_id?: string | null
  user_email?: string | null

  source?: string | null
  referrer?: string | null

  metadata?: Record<string, any>

  ip?: string | null
  user_agent?: string | null
}

export async function trackEvent(data: TrackEventInput) {

  try {

    const { error } = await supabase
      .from("campaign_events")
      .insert({
        event_type: data.event_type,

        campaign_id: data.campaign_id || null,
        payment_id: data.payment_id || null,

        session_id: data.session_id || null,
        user_email: data.user_email || null,

        source: data.source || null,
        referrer: data.referrer || null,

        metadata: data.metadata || {},

        ip: data.ip || null,
        user_agent: data.user_agent || null
      })

    if (error) {

  // ✅ ignorar duplicados idempotentes
  if (error.code === "23505") {
    return
  }

  console.error("trackEvent insert error:", error)
}

  } catch (err) {

    console.error("trackEvent fatal error:", err)

  }
}