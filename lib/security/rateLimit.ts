import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function rateLimit(user_email: string, action: string) {
  const now = new Date()
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)

  // 🔥 registrar intento actual
  await supabase.from("rate_limits").insert({
    user_email,
    action
  })

  // 🔥 contar intentos recientes
  const { data } = await supabase
    .from("rate_limits")
    .select("id")
    .eq("user_email", user_email)
    .eq("action", action)
    .gte("created_at", oneMinuteAgo.toISOString())

  const count = data?.length || 0

  // 🚨 reglas
  if (action === "withdraw" && count > 3) {
    return {
      blocked: true,
      reason: "Demasiados intentos de retiro"
    }
  }

  if (action === "otp" && count > 5) {
    return {
      blocked: true,
      reason: "Abuso de OTP detectado"
    }
  }

  return {
    blocked: false
  }
}