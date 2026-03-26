import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function detectFraud(user_email: string) {
  let riskScore = 0

  // 1. Retiros recientes (24h)
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id")
    .eq("user_email", user_email)
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    )

  if (withdrawals && withdrawals.length >= 3) {
    riskScore += 40
  }

  // 2. OTP abuso
  const { data: otps } = await supabase
    .from("otp_codes")
    .select("id")
    .eq("user_email", user_email)
    .gte(
      "created_at",
      new Date(Date.now() - 60 * 60 * 1000).toISOString()
    )

  if (otps && otps.length >= 5) {
    riskScore += 30
  }

  // 3. Score previo
  const { data: risk } = await supabase
    .from("user_risk")
    .select("score")
    .eq("user_email", user_email)
    .single()

  if (risk?.score >= 50) {
    riskScore += 30
  }

  // 4. Dispositivos/IP (multi-cuenta)
  const { data: devices } = await supabase
    .from("user_devices")
    .select("ip")
    .eq("user_email", user_email)

  if (devices && devices.length >= 3) {
    riskScore += 40
  }

  // 5. IP compartida (multi-cuenta)
  const { data: sameIp } = await supabase
    .from("user_devices")
    .select("user_email")
    .eq("ip", devices?.[0]?.ip || "")

  if (sameIp && sameIp.length >= 3) {
    riskScore += 50
  }

  // 🔥 resultado final
  const isDanger = riskScore >= 70

  // actualizar score
  await supabase
    .from("user_risk")
    .update({
      score: riskScore,
      status: isDanger ? "blocked" : "normal"
    })
    .eq("user_email", user_email)

  // log fraude
  if (isDanger) {
    await supabase.from("fraud_logs").insert({
      user_email,
      reason: `AUTO-DETECT SCORE: ${riskScore}`
    })
  }

  return {
    riskScore,
    isDanger
  }
}
