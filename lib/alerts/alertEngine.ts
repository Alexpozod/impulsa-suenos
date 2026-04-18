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

  let score = (risk as any).score || 0
  const flags = [...risk.flags]

  /* =========================
     💸 RETIRO SOSPECHOSO
  ========================= */
  if (ctx.payout && ctx.payout.amount > ctx.campaign.balance * 0.8) {
    score += 30
    flags.push("high_withdraw_ratio")
  }

  if (score > 100) score = 100

  /* =========================
     🔴 CRÍTICO
  ========================= */
  if (score >= 80) {

    /* 🔥 AUTO FREEZE (NUEVO) */
    try {
      await supabase
        .from("campaigns")
        .update({
          status: "frozen",
          updated_at: new Date().toISOString()
        })
        .eq("id", ctx.campaign.id)
    } catch (e) {
      console.error("AUTO FREEZE ERROR:", e)
    }

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