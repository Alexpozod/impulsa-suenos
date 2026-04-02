import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🚨 FRAUD ENGINE PRO
========================= */
export async function evaluateFraud(user_email: string) {

  /* =========================
     📊 DATA
  ========================= */
  const { data: ledger } = await supabase
    .from("financial_ledger")
    .select("*")
    .eq("user_email", user_email)
    .order("created_at", { ascending: false })

  let score = 0
  const reasons: string[] = []

  /* =========================
     🔥 RULE 1: PAGOS ALTOS
  ========================= */
  ledger?.forEach((l) => {
    if (Number(l.amount) > 1000000) {
      score += 40
      reasons.push("Pago alto")
    }
  })

  /* =========================
     ⚡ RULE 2: FRECUENCIA
  ========================= */
  if (ledger && ledger.length >= 5) {
    score += 20
    reasons.push("Alta frecuencia")
  }

  /* =========================
     💰 RULE 3: VOLUMEN TOTAL
  ========================= */
  const total =
    ledger?.reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

  if (total > 5000000) {
    score += 30
    reasons.push("Alto volumen")
  }

  /* =========================
     🎯 LEVEL
  ========================= */
  let level: "low" | "medium" | "high" = "low"

  if (score >= 80) level = "high"
  else if (score >= 40) level = "medium"

  /* =========================
     💾 SAVE SCORE
  ========================= */
  await supabase.from("fraud_scores").insert({
    user_email,
    score,
    level,
    reasons,
  })

  /* =========================
     🚫 AUTO BLOCK
  ========================= */
  if (level === "high") {
    await supabase.from("fraud_blocks").insert({
      user_email,
      reason: reasons.join(", "),
    })
  }

  return {
    score,
    level,
    reasons,
  }
}