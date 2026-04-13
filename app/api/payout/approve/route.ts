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

    const reconciliation = await reconcileCampaign(payout.campaign_id)

    if (!reconciliation.ok) {
      return NextResponse.json({ error: "reconciliation_failed" }, { status: 500 })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .single()

    /* =========================
       🧠 RIESGO / FRAUDE
    ========================= */
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
      risk
    })

    if (enforcement.blocked) {
      return NextResponse.json({ error: "blocked" }, { status: 403 })
    }

    /* =========================
       💰 LEDGER
    ========================= */
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

    /* =========================
       👛 WALLET FIX (CRÍTICO)
    ========================= */
    await supabase
      .from("wallets")
      .update({
        balance: supabase.raw(`balance - ${payout.amount}`),
        pending: supabase.raw(`pending - ${payout.amount}`)
      })
      .eq("user_email", campaign.user_email)

    /* =========================
       📦 ESTADO PAYOUT
    ========================= */
    await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    /* =========================
       📊 CAMPAIGN
    ========================= */
    await supabase
      .from("campaigns")
      .update({
        total_withdrawn: (campaign.total_withdrawn || 0) + payout.amount,
        balance: (campaign.balance || 0) - payout.amount
      })
      .eq("id", payout.campaign_id)

    /* =========================
       📣 EVENTOS
    ========================= */
    await emitEvent("payout.approved", {
      id: payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount
    })

    logInfo("Payout aprobado", { payout_id })

    return NextResponse.json({ ok: true })

  } catch (error) {

    logError("PAYOUT ERROR", error)

    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}