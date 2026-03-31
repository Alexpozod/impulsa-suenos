import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { emitEvent } from "@/lib/events/eventBus"

type AlertContext = {
  campaign: any
  payout?: any
  actor_id?: string
}

export async function evaluateFraudAlert(ctx: AlertContext) {
  const risk = evaluateCampaignRisk(ctx.campaign)

  // 🔢 SCORE DERIVADO (compatibilidad)
  const score = risk.flags.length * 30 // simple pero efectivo

  /* =========================
     🔴 CRÍTICO
  ========================= */
  if (score >= 80 || !risk.safe) {
    await emitEvent("alert.fraud_detected", {
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id,
      flags: risk.flags,
      score,
      severity: "critical"
    })

    return {
      block: true,
      reason: "high_risk_detected",
      risk: {
        ...risk,
        score
      }
    }
  }

  /* =========================
     🟡 WARNING
  ========================= */
  if (score >= 50) {
    await emitEvent("alert.risk_warning", {
      campaign_id: ctx.campaign.id,
      flags: risk.flags,
      score,
      severity: "warning"
    })

    return {
      block: false,
      warning: true,
      risk: {
        ...risk,
        score
      }
    }
  }

  /* =========================
     🟢 OK
  ========================= */
  return {
    block: false,
    risk: {
      ...risk,
      score
    }
  }
}
