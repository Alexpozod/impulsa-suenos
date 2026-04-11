import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logSystemEvent({
  type,
  severity = "info",
  message,
  metadata = {}
}: {
  type: string
  severity?: "info" | "warning" | "critical"
  message: string
  metadata?: any
}) {
  try {
    await supabase.from("system_events").insert({
      type,
      severity,
      message,
      metadata
    })
  } catch (err) {
    console.error("❌ logSystemEvent error", err)
  }
}