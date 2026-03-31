import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { emitEvent } from "@/lib/events/eventBus"

type AlertContext = {
  campaign: any
  payout?: any
  actor_id?: string
}

type FraudResult = {
  block: boolean
  warning?: boolean
  reason?: string
  risk: any
}

export async function evaluateFraudAlert(
  ctx: AlertContext
): Promise<FraudResult> {
  try {
    if (!ctx?.campaign) {
      return {
        block: false,
        reason: "no_campaign",
        risk: null
      }
    }

    const risk = evaluateCampaignRisk(ctx.campaign)

    /* =========================
       🔴 CRITICAL RISK
    ========================= */
    if (risk.score >= 80 || !risk.safe) {
      await emitEvent("alert.fraud_detected", {
        campaign_id: ctx.campaign.id,
        payout_id: ctx.payout?.id || null,
        actor_id: ctx.actor_id || "system",
        risk,
        severity: "critical",
        created_at: new Date().toISOString()
      })

      return {
        block: true,
        reason: "high_risk_detected",
        risk
      }
    }

    /* =========================
       🟡 WARNING
    ========================= */
    if (risk.score >= 50) {
      await emitEvent("alert.risk_warning", {
        campaign_id: ctx.campaign.id,
        payout_id: ctx.payout?.id || null,
        actor_id: ctx.actor_id || "system",
        risk,
        severity: "warning",
        created_at: new Date().toISOString()
      })

      return {
        block: false,
        warning: true,
        risk
      }
    }

    /* =========================
       🟢 SAFE
    ========================= */
    return {
      block: false,
      risk
    }

  } catch (error) {
    console.error("❌ FRAUD ALERT ERROR:", error)

    return {
      block: false,
      reason: "alert_error",
      risk: null
    }
  }
}
