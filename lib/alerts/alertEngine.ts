import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { emitEvent } from "@/lib/events/eventBus"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type AlertContext = {
  campaign: any
  payout?: any
  actor_id?: string
}

export async function evaluateFraudAlert(ctx: AlertContext) {

  const risk = evaluateCampaignRisk(ctx.campaign)

  let score = risk.score
  const flags = [...risk.flags]

  /* =========================
     💸 RETIRO SOSPECHOSO
  ========================= */
  if (ctx.payout && ctx.payout.amount > ctx.campaign.balance * 0.8) {
    score += 30
    flags.push("high_withdraw_ratio")
  }

  /* =========================
     💰 NUEVO — ALERTAS FINANCIERAS
     (NO rompe lo existente)
  ========================= */

  // 🔴 campaña sin balance
  if (ctx.campaign.balance <= 0 && ctx.campaign.total_raised > 0) {
    score += 20
    flags.push("no_balance")
  }

  // 🔴 fees altos
  if (
    ctx.campaign.total_raised > 0 &&
    ctx.campaign.total_withdrawn + ctx.campaign.balance > ctx.campaign.total_raised * 0.9
  ) {
    score += 15
    flags.push("high_outflow")
  }

  if (score > 100) score = 100

  /* =========================
     🔴 CRÍTICO
  ========================= */
  if (score >= 80) {

    await supabase.from("fraud_alerts").insert({
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id || null,
      severity: "critical",
      type: "fraud_detected",
      flags,
      score,
      metadata: ctx
    })

    await emitEvent("alert.fraud_detected", {
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id,
      flags,
      score
    })

    return {
      block: true,
      reason: "high_risk_detected",
      risk: { score, flags, safe: false }
    }
  }

  /* =========================
     🟡 WARNING
  ========================= */
  if (score >= 50) {

    await supabase.from("fraud_alerts").insert({
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id || null,
      severity: "warning",
      type: "risk_warning",
      flags,
      score,
      metadata: ctx
    })

    await emitEvent("alert.risk_warning", {
      campaign_id: ctx.campaign.id,
      flags,
      score
    })

    return {
      block: false,
      warning: true,
      risk: { score, flags, safe: score < 60 }
    }
  }

  return {
    block: false,
    risk: { score, flags, safe: true }
  }
}