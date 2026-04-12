import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { emitEvent } from "@/lib/events/eventBus"
import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { canAccess } from "@/lib/auth/rbac"
import { evaluateFraudAlert } from "@/lib/alerts/alertEngine"
import { enforceRiskActions } from "@/lib/security/enforceRisk"
import { reconcileCampaign } from "@/lib/finance/reconcilePayments"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { logSystemEvent } from "@/lib/system/logger"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { payout_id } = await req.json()

    if (!payout_id) {
      return NextResponse.json({ error: "payout_id requerido" }, { status: 400 })
    }

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    const userRole = user.user_metadata?.role || "user"

    if (!canAccess(userRole, "payout.approve")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const orgId = user.user_metadata?.organization_id

    const { data: payout } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .eq("organization_id", orgId)
      .single()

    if (!payout) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    if (payout.status === "paid") {
      return NextResponse.json({ error: "already processed" }, { status: 400 })
    }

    if (payout.amount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 })
    }

    const reconciliation = await reconcileCampaign(payout.campaign_id)

    if (!reconciliation.ok || typeof reconciliation.balance !== "number") {

      await sendAlert({
        title: "Error conciliación",
        message: "Falló conciliación en payout",
        data: { payout_id }
      })

      return NextResponse.json({ error: "reconciliation_failed" }, { status: 500 })
    }

    if (payout.amount > reconciliation.balance) {
      return NextResponse.json(
        { error: "insufficient_real_balance" },
        { status: 400 }
      )
    }

    if (payout.amount > reconciliation.balance * 0.8) {
      await sendAlert({
        title: "Payout alto",
        message: "Retiro cercano al total",
        data: { payout_id }
      })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .eq("organization_id", orgId)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "campaign not found" }, { status: 404 })
    }

    // 🔐 VALIDACIÓN CONSISTENCIA BALANCE
    const dbBalance = Number(campaign.balance || 0)
    const realBalance = Number(reconciliation.balance || 0)
    const diff = Math.abs(dbBalance - realBalance)

    if (diff > 1) {

      await logSystemEvent({
        type: "balance_mismatch",
        severity: "critical",
        message: "Descuadre entre ledger y campaign.balance",
        metadata: {
          campaign_id: payout.campaign_id,
          dbBalance,
          realBalance,
          diff
        }
      })

      await sendAlert({
        title: "Descuadre financiero",
        message: "Balance inconsistente detectado",
        data: {
          campaign_id: payout.campaign_id,
          dbBalance,
          realBalance,
          diff
        }
      })

      return NextResponse.json(
        { error: "balance_mismatch" },
        { status: 500 }
      )
    }

    const risk = evaluateCampaignRisk(campaign)

    const fraud = await evaluateFraudAlert({
      campaign,
      payout,
      actor_id: user.id
    })

    if (fraud.block) {
      return NextResponse.json({ error: "fraud_detected" }, { status: 403 })
    }

    const enforcement = await enforceRiskActions({
      campaign,
      payout,
      risk: {
        ...risk,
        score: (risk.flags?.length || 0) * 30
      }
    })

    if (enforcement.blocked) {
      return NextResponse.json({ error: "campaign_blocked" }, { status: 403 })
    }

    await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    // 🔐 NO eliminar historial, marcar como reemplazado
    await supabase
      .from("financial_ledger")
      .update({
        status: "replaced_by_payout",
        metadata: {
          replaced_at: new Date().toISOString(),
          payout_id: payout.id
        }
      })
      .eq("payment_id", `pending_${payout.id}`)

    await supabase.from("financial_ledger").insert({
      campaign_id: payout.campaign_id,
      user_email: campaign.user_email,
      amount: -Math.abs(payout.amount),
      type: "withdraw",
      flow_type: "out",
      payment_id: `payout_${payout.id}`,
      created_at: new Date().toISOString(),
      organization_id: orgId
    })

    await supabase
      .from("campaigns")
      .update({
        total_withdrawn: (campaign.total_withdrawn || 0) + payout.amount,
        balance: (campaign.balance || 0) - payout.amount
      })
      .eq("id", payout.campaign_id)

    await logSystemEvent({
      type: "payout_success",
      severity: "info",
      message: "Payout aprobado",
      metadata: { payout_id, amount: payout.amount }
    })

    await emitEvent("payout.approved", {
      id: payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount,
      actor_id: user.id,
      organization_id: orgId
    })

    await logToDB("info", "payout_approved", {
      payout_id,
      campaign_id: payout.campaign_id
    })

    logInfo("Payout aprobado correctamente", {
      payout_id,
      campaign_id: payout.campaign_id
    })

    return NextResponse.json({ ok: true })

  } catch (error) {

    await logSystemEvent({
      type: "payout_crash",
      severity: "critical",
      message: "Error aprobando payout",
      metadata: { error }
    })

    logError("APPROVE ERROR", error)
    await logErrorToDB("approve_payout_error", error)

    await sendAlert({
      title: "Error payout",
      message: "Fallo aprobación",
      data: { error }
    })

    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}