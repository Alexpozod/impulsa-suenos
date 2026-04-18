import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { canAccess } from "@/lib/auth/rbac"
import { evaluateFraudAlert } from "@/lib/alerts/alertEngine"
import { enforceRiskActions } from "@/lib/security/enforceRisk"
import { reconcileCampaign } from "@/lib/finance/reconcilePayments"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"

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

    /* =========================
       📦 PAYOUT
    ========================= */
    const { data: payout } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .maybeSingle()

    if (!payout) {
      return NextResponse.json({ error: "payout not found" }, { status: 404 })
    }

    if (payout.status === "paid") {
      return NextResponse.json({ error: "already processed" }, { status: 400 })
    }

    if (payout.amount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 })
    }

    /* =========================
       💰 CONCILIACIÓN
    ========================= */
    const reconciliation = await reconcileCampaign(payout.campaign_id)

    if (!reconciliation.ok || typeof reconciliation.balance !== "number") {
      return NextResponse.json({ error: "reconciliation_failed" }, { status: 500 })
    }

    if (payout.amount > reconciliation.balance) {
      return NextResponse.json({ error: "insufficient_balance" }, { status: 400 })
    }

    /* =========================
       📊 CAMPAIGN
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ error: "campaign not found" }, { status: 404 })
    }

    /* =========================
       🧠 CAMPAIGN REAL
    ========================= */
    const campaignWithBalance = {
      ...campaign,
      balance: reconciliation.balance,
      total_raised: (reconciliation as any).totalIn || 0,
      total_withdrawn: (reconciliation as any).totalOut || 0
    }

    /* =========================
       🧠 RIESGO
    ========================= */
    const risk = evaluateCampaignRisk(campaign)

    /* =========================
       🚨 FRAUDE
    ========================= */
    const fraud = await evaluateFraudAlert({
      campaign: campaignWithBalance,
      payout,
      actor_id: user.id
    })

    /* =========================
       🔍 LOG SEGURO (FIX)
    ========================= */
    logToDB(
      "fraud_check",
      JSON.stringify({
        payout_id,
        campaign_id: campaign.id,
        balance: reconciliation.balance,
        amount: payout.amount,
        result: fraud
      })
    ).catch(() => {})

    if (fraud.block) {
      return NextResponse.json({ error: "fraud_detected" }, { status: 403 })
    }

    /* =========================
       🔐 ENFORCEMENT
    ========================= */
    const enforcement = await enforceRiskActions({
      campaign: campaignWithBalance,
      payout,
      risk: {
        ...risk,
        score: (risk.flags?.length || 0) * 30
      }
    })

    if (enforcement.blocked) {
      return NextResponse.json({ error: "blocked" }, { status: 403 })
    }

    /* =========================
       💰 LEDGER
    ========================= */
    await supabase
      .from("financial_ledger")
      .delete()
      .eq("payment_id", `pending_${payout.id}`)

    await supabase
      .from("financial_ledger")
      .insert({
        campaign_id: payout.campaign_id,
        user_email: campaign.user_email,
        amount: -Math.abs(payout.amount),
        type: "withdraw",
        status: "confirmed",
        flow_type: "out",
        payment_id: `payout_${payout.id}`,
        created_at: new Date().toISOString()
      })

    /* =========================
       📦 PAYOUT
    ========================= */
    await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email: campaign.user_email,
      type: "payout_paid",
      title: "Retiro aprobado",
      message: `Tu retiro de $${payout.amount} fue aprobado`,
      metadata: { payout_id }
    })

    logInfo("Payout aprobado", { payout_id })

    return NextResponse.json({
      ok: true,
      message: "Payout aprobado correctamente"
    })

  } catch (error) {

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