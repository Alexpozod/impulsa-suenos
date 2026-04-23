import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { canAccess } from "@/lib/auth/rbac"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const body = await req.json()
    const payout_id = body?.payout_id

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

    const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .maybeSingle()

const role = profile?.role || "user"

    if (!canAccess(role, "payout.reject")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* =========================
       📦 PAYOUT
    ========================= */
    const { data: payout } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .single()

    if (!payout) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    if (payout.status !== "pending") {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 })
    }

    const amount = Number(payout.amount)

    /* =========================
       👤 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", payout.campaign_id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "campaign not found" }, { status: 404 })
    }

    const user_email = campaign.user_email

    /* =========================
       👛 WALLET REVERSA
    ========================= */
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_email", user_email)
      .maybeSingle()

    if (wallet) {
      await supabase
  .from("wallets")
  .update({
    available_balance: Number(wallet.available_balance || 0), // 🔥 NO SUMAR
    pending_balance: Math.max(
      Number(wallet.pending_balance || 0) - amount,
      0
    )
  })
  .eq("user_email", user_email)
    }

    /* =========================
       💰 LEDGER
    ========================= */

    // 🔥 FIX CRÍTICO: eliminar pending real del sistema
    await supabase
  .from("financial_ledger")
  .delete()
  .eq("campaign_id", payout.campaign_id)
  .eq("user_email", user_email)
  .eq("type", "withdraw_pending")

    /* =========================
       📦 UPDATE
    ========================= */
    await supabase
      .from("payouts")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email,
      type: "payout_rejected",
      title: "Retiro rechazado",
      message: `Tu retiro de $${amount} fue rechazado`,
      metadata: { payout_id }
    })

    logInfo("Payout rechazado", { payout_id })

    return NextResponse.json({ ok: true })

  } catch (error) {

    logError("REJECT ERROR", error)
    await logErrorToDB("reject_payout_error", error)

    await sendAlert({
      title: "Error reject payout",
      message: "Fallo rechazo",
      data: { error }
    })

    return NextResponse.json(
      { error: "error reject payout" },
      { status: 500 }
    )
  }
}