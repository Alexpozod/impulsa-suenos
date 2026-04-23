import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logFraudEvent({
  type,
  severity = "low",
  user_email,
  ip,
  metadata = {}
}: {
  type: string
  severity?: "low" | "medium" | "high" | "critical"
  user_email?: string
  ip?: string
  metadata?: any
}) {
  try {
    await supabase.from("fraud_logs").insert({
      type,
      severity,
      user_email,
      ip,
      metadata,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("fraudLogger error", error)
  }
}