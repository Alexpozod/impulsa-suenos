import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { emitEvent } from "@/lib/events/eventBus"
import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { canAccess } from "@/lib/auth/rbac"
import { evaluateFraudAlert } from "@/lib/alerts/alertEngine"

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
       🔐 RBAC (FASE 5)
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

    /* =========================
       🚫 DOBLE PROCESO
    ========================= */
    if (payout.status === "paid") {
      return NextResponse.json(
        { error: "payout ya procesado" },
        { status: 400 }
      )
    }

    /* =========================
       📊 CAMPAIGN DATA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .single()

    /* =========================
       🛡 RISK ENGINE
    ========================= */
    if (campaign) {
      const risk = evaluateCampaignRisk(campaign)

      if (!risk.safe) {
        // 🔔 ALERTA DE FRAUDE
        await evaluateFraudAlert({
          type: "campaign_risk_blocked",
          campaign_id: campaign.id,
          payout_id,
          flags: risk.flags
        })

        return NextResponse.json(
          {
            error: "campaign_flagged",
            risk
          },
          { status: 403 }
        )
      }
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
       📒 LEDGER (SALIDA REAL)
    ========================= */
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        campaign_id: payout.campaign_id,
        amount: payout.amount,
        type: "withdraw",
        status: "confirmed"
      })

    if (ledgerError) {
      // 🔴 ROLLBACK LÓGICO
      await supabase
        .from("payouts")
        .update({ status: "pending" })
        .eq("id", payout_id)

      // 🔔 ALERTA CRÍTICA
      await evaluateFraudAlert({
        type: "ledger_failure",
        payout_id,
        campaign_id: payout.campaign_id,
        amount: payout.amount
      })

      return NextResponse.json(
        { error: "error registrando ledger" },
        { status: 500 }
      )
    }

    /* =========================
       🔔 EVENT SYSTEM (AUDIT)
    ========================= */
    await emitEvent("payout.approved", {
      id: payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount,
      actor_id: user.id
    })

    /* =========================
       🧠 FRAUD ALERT (POST SUCCESS)
    ========================= */
    await evaluateFraudAlert({
      type: "payout_processed",
      payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount
    })

    return NextResponse.json({
      ok: true,
      payout_id,
      status: "paid"
    })

  } catch (error) {
    console.error("❌ APPROVE PAYOUT ERROR:", error)

    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}
