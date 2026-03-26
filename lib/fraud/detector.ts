import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function detectFraud(user_email: string) {
  let riskScore = 0

  // 1. Retiros recientes (últimas 24h)
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_email", user_email)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  if (withdrawals && withdrawals.length >= 3) {
    riskScore += 40
  }

  // 2. OTP abusado
  const { data: otps } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("user_email", user_email)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())

  if (otps && otps.length >= 5) {
    riskScore += 30
  }

  // 3. Score existente
  const { data: risk } = await supabase
    .from("user_risk")
    .select("score")
    .eq("user_email", user_email)
    .single()

  if (risk?.score >= 50) {
    riskScore += 30
  }

  // 4. Resultado final
  const isDanger = riskScore >= 70

  // Guardar score actualizado
  await supabase
    .from("user_risk")
    .update({
      score: riskScore,
      status: isDanger ? "blocked" : "normal"
    })
    .eq("user_email", user_email)

  // Log si es crítico
  if (isDanger) {
    await supabase.from("fraud_logs").insert({
      user_email,
      reason: `AUTO-DETECT: score ${riskScore}`
    })
  }

  return {
    riskScore,
    isDanger
  }
}
