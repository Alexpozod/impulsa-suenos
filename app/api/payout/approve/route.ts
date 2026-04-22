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

    const reconciliation = await reconcileCampaign(payout.campaign_id)

    if (!reconciliation.ok || typeof reconciliation.balance !== "number") {
      return NextResponse.json({ error: "reconciliation_failed" }, { status: 500 })
    }

    /* =========================
       🔍 BALANCE REAL DESDE LEDGER
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", payout.campaign_id)
      .eq("user_email", payout.user_email)
      .eq("status", "confirmed")

    const realBalance = (ledger || []).reduce(
      (acc: number, tx: any) => acc + Number(tx.amount || 0),
      0
    )

    if (payout.amount > realBalance) {
      return NextResponse.json({ error: "insufficient_balance" }, { status: 400 })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ error: "campaign not found" }, { status: 404 })
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
      return NextResponse.json({ error: "blocked" }, { status: 403 })
    }

    /* =========================
       💰 LEDGER (IDEMPOTENTE)
    ========================= */

    const { data: existingLedger } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", `payout_${payout.id}`)
      .maybeSingle()

    if (!existingLedger) {

      await supabase
        .from("financial_ledger")
        .delete()
        .eq("payment_id", `pending_${payout.id}`)

      const { error: ledgerError } = await supabase
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

      if (ledgerError) {
        console.error("❌ ledger insert error", ledgerError)

        await logSystemEvent({
          type: "ledger_error",
          severity: "critical",
          message: "Error insertando retiro en ledger",
          metadata: { payout_id, ledgerError }
        })

        return NextResponse.json(
          { error: "ledger_insert_failed" },
          { status: 500 }
        )
      }
    }

    /* =========================
       💰 WALLET (CONSISTENTE)
    ========================= */

    const { data: ledgerAfter } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("user_email", campaign.user_email)
      .eq("status", "confirmed")

    const realBalanceAfter = (ledgerAfter || []).reduce(
      (acc: number, tx: any) => acc + Number(tx.amount || 0),
      0
    )

    const { error: walletError } = await supabase
      .from("wallets")
      .update({
        balance: realBalanceAfter
      })
      .eq("user_email", campaign.user_email)

    if (walletError) {
      console.error("❌ wallet update error", walletError)

      await logSystemEvent({
        type: "wallet_error",
        severity: "critical",
        message: "Error sincronizando wallet",
        metadata: { payout_id, walletError }
      })
    }

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
       📧 NOTIFICACIÓN
    ========================= */

    await sendNotification({
      user_email: campaign.user_email,
      type: "payout_paid",
      title: "Retiro aprobado",
      message: `Tu retiro de $${payout.amount} fue aprobado`,
      metadata: { payout_id },
      sendEmail: true
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