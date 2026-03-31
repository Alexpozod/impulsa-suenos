import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { emitEvent } from "@/lib/events/eventBus"
import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { canAccess } from "@/lib/auth/rbac"
import { evaluateFraudAlert } from "@/lib/alerts/alertEngine"
import { enforceRiskActions } from "@/lib/security/enforceRisk"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { payout_id, user } = body

    /* =========================
       ❗ VALIDACIÓN INPUT
    ========================= */
    if (!payout_id) {
      return NextResponse.json(
        { error: "payout_id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       🔐 RBAC
    ========================= */
    if (!user || !canAccess(user.role, "payout.approve")) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 403 }
      )
    }

    /* =========================
       📦 OBTENER PAYOUT
    ========================= */
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .single()

    if (payoutError || !payout) {
      return NextResponse.json(
        { error: "payout no encontrado" },
        { status: 404 }
      )
    }

    if (payout.status === "paid") {
      return NextResponse.json(
        { error: "payout ya procesado" },
        { status: 400 }
      )
    }

    /* =========================
       📊 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .single()

    if (!campaign) {
      return NextResponse.json(
        { error: "campaign not found" },
        { status: 404 }
      )
    }

    /* =========================
       🧠 RISK ENGINE
    ========================= */
    const risk = evaluateCampaignRisk(campaign)

    /* =========================
       🚨 FRAUD ALERT (PRE)
    ========================= */
    const fraud = await evaluateFraudAlert({
      campaign,
      payout,
      actor_id: user.id
    })

    if (fraud.block) {
      return NextResponse.json(
        { error: "fraud_detected", fraud },
        { status: 403 }
      )
    }

    /* =========================
       🔒 ENFORCEMENT AUTOMÁTICO
    ========================= */
    const enforcement = await enforceRiskActions({
      campaign,
      payout,
      risk: {
        ...risk,
        score: (risk.flags?.length || 0) * 30
      }
    })

    if (enforcement.blocked) {
      return NextResponse.json(
        { error: "campaign_blocked", enforcement },
        { status: 403 }
      )
    }

    /* =========================
       💰 ACTUALIZAR PAYOUT
    ========================= */
    const { error: updateError } = await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    if (updateError) {
      return NextResponse.json(
        { error: "error actualizando payout" },
        { status: 500 }
      )
    }

    /* =========================
       📒 LEDGER (CON ORG ID)
    ========================= */
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        campaign_id: payout.campaign_id,
        amount: payout.amount,
        type: "withdraw",
        status: "confirmed",
        organization_id: campaign.organization_id
      })

    if (ledgerError) {
      await supabase
        .from("payouts")
        .update({ status: "pending" })
        .eq("id", payout_id)

      return NextResponse.json(
        { error: "ledger_error" },
        { status: 500 }
      )
    }

    /* =========================
       🔔 EVENTO FINAL
    ========================= */
    await emitEvent("payout.approved", {
      id: payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount,
      actor_id: user.id,
      organization_id: campaign.organization_id
    })

    /* =========================
       🧠 FRAUD POST
    ========================= */
    await evaluateFraudAlert({
      campaign,
      payout,
      actor_id: user.id
    })

    return NextResponse.json({
      ok: true,
      payout_id,
      status: "paid"
    })

  } catch (error) {
    console.error("❌ APPROVE ERROR:", error)

    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}
