import { createClient } from "@supabase/supabase-js"
import { emitEvent } from "@/lib/events/eventBus"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type EnforceContext = {
  campaign: any
  payout?: any
  risk: {
    score: number
    flags: string[]
    safe: boolean
  }
}

export async function enforceRiskActions(ctx: EnforceContext) {
  const { campaign, payout, risk } = ctx

  /* =========================
     🔴 CRITICAL BLOCK
  ========================= */
  if (risk.score >= 80 || !risk.safe) {

    // 🚫 BLOQUEAR CAMPAÑA
    await supabase
      .from("campaigns")
      .update({
        status: "blocked",
        blocked_reason: "fraud_detected"
      })
      .eq("id", campaign.id)

    // 🚫 BLOQUEAR PAYOUTS PENDIENTES
    await supabase
      .from("payouts")
      .update({ status: "blocked" })
      .eq("campaign_id", campaign.id)
      .eq("status", "pending")

    // 🔔 EVENTO
    await emitEvent("system.campaign_blocked", {
      campaign_id: campaign.id,
      payout_id: payout?.id || null,
      risk
    })

    return {
      blocked: true,
      level: "critical"
    }
  }

  /* =========================
     🟡 WARNING
  ========================= */
  if (risk.score >= 50) {
    await emitEvent("system.campaign_warning", {
      campaign_id: campaign.id,
      risk
    })

    return {
      blocked: false,
      level: "warning"
    }
  }

  return {
    blocked: false,
    level: "safe"
  }
}