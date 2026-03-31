import { emitEvent } from "@/lib/events/eventBus"
import { evaluateCampaignRisk } from "@/lib/risk/riskEngine"
import { canAccess } from "@/lib/auth/rbac"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { payout_id, user } = body

    if (!payout_id) {
      return NextResponse.json(
        { error: "payout_id requerido" },
        { status: 400 }
      )
    }

    // 🔐 1. RBAC CHECK (FASE 5 - SECURITY LAYER)
    if (!user || !canAccess(user.role, "payout.approve")) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 403 }
      )
    }

    // 2. obtener payout
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

    // 3. evitar doble pago
    if (payout.status === "paid") {
      return NextResponse.json(
        { error: "payout ya procesado" },
        { status: 400 }
      )
    }

    // 4. obtener campaign para risk engine
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", payout.campaign_id)
      .single()

    if (campaign) {
      // 🛡 5. RISK ENGINE CHECK
      const risk = evaluateCampaignRisk(campaign)

      if (!risk.safe) {
        return NextResponse.json(
          {
            error: "campaign_flagged",
            risk
          },
          { status: 403 }
        )
      }
    }

    // 6. actualizar payout a pagado
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

    // 7. registrar en ledger (SALIDA REAL)
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        campaign_id: payout.campaign_id,
        amount: payout.amount,
        type: "withdraw",
        status: "confirmed"
      })

    if (ledgerError) {
      // 🔴 rollback lógico
      await supabase
        .from("payouts")
        .update({ status: "pending" })
        .eq("id", payout_id)

      return NextResponse.json(
        { error: "error registrando ledger" },
        { status: 500 }
      )
    }

    // 🔔 8. EVENT SYSTEM (AUDIT TRAIL ENTERPRISE)
    await emitEvent("payout.approved", {
      id: payout_id,
      campaign_id: payout.campaign_id,
      amount: payout.amount,
      actor_id: user.id
    })

    return NextResponse.json({
      ok: true,
      payout_id,
      status: "paid"
    })

  } catch (error) {
    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}
