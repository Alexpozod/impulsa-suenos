import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { emitEvent } from "@/lib/events/eventBus"

type AlertContext = {
  campaign: any
  payout?: any
  actor_id?: string
}

export async function evaluateFraudAlert(ctx: AlertContext) {
  const risk = evaluateCampaignRisk(ctx.campaign)

  // 🔴 THRESHOLD CRÍTICO
  if (risk.score >= 80 || !risk.safe) {
    await emitEvent("alert.fraud_detected", {
      campaign_id: ctx.campaign.id,
      payout_id: ctx.payout?.id,
      risk,
      severity: "critical"
    })

    return {
      block: true,
      reason: "high_risk_detected",
      risk
    }
  }

  // 🟡 WARNING LEVEL
  if (risk.score >= 50) {
    await emitEvent("alert.risk_warning", {
      campaign_id: ctx.campaign.id,
      risk,
      severity: "warning"
    })

    return {
      block: false,
      warning: true,
      risk
    }
  }

  return {
    block: false,
    risk
  }
}
