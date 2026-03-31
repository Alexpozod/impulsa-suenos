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

  const score = risk.flags.length * 30

  /* =========================
     🔴 CRÍTICO
  ========================= */
  if (score >= 80 || !risk.safe) {

    // 🔥 GUARDAR ALERTA REAL
    await supabase.from("fraud_alerts").insert({
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id || null,
      severity: "critical",
      type: "fraud_detected",
      flags: risk.flags,
      score,
      metadata: ctx
    })

    await emitEvent("alert.fraud_detected", {
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id,
      flags: risk.flags,
      score
    })

    return {
      block: true,
      reason: "high_risk_detected",
      risk: { ...risk, score }
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
      flags: risk.flags,
      score,
      metadata: ctx
    })

    await emitEvent("alert.risk_warning", {
      campaign_id: ctx.campaign.id,
      flags: risk.flags,
      score
    })

    return {
      block: false,
      warning: true,
      risk: { ...risk, score }
    }
  }

  return {
    block: false,
    risk: { ...risk, score }
  }
}
