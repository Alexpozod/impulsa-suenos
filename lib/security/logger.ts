import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logSecurityEvent({
  user_email,
  user_id,
  action,
  status,
  ip,
  user_agent,
  metadata
}: {
  user_email?: string | null
  user_id?: string | null
  action: string
  status: string
  ip?: string | null
  user_agent?: string | null
  metadata?: any
}) {
  try {
    await supabase.from("security_logs").insert({
      user_email: user_email || null,
      user_id: user_id || null,
      action,
      status,
      ip,
      user_agent,
      metadata: metadata || null
    })
  } catch (err) {
    console.error("❌ logSecurityEvent error", err)
  }
}
