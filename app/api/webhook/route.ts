import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    console.log("🔥 WEBHOOK HIT")

    const url = new URL(req.url)

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    if (!paymentId) {
      try {
        const body = await req.json()
        paymentId = body?.data?.id || body?.id || null
      } catch {}
    }

    console.log("🔥 PAYMENT ID:", paymentId)

    if (!paymentId) return NextResponse.json({ ok: true })

    const payment = await paymentClient.get({ id: paymentId })

    console.log("🔥 PAYMENT STATUS:", payment?.status)

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id
    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email

    const amount = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)
    const message = payment.metadata?.message || ""

    console.log("🔥 DATA:", {
      campaign_id,
      user_email,
      amount,
      tip
    })

    if (!campaign_id || !user_email) {
      console.log("❌ missing data")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💾 LOG (idempotencia)
    ========================= */
    await supabase.from("payment_logs").insert({
      payment_id: paymentId,
      campaign_id,
      status: "approved",
      message,
      payload: payment,
      created_at: new Date().toISOString()
    })

    /* =========================
       💰 INSERT DIRECTO (🔥 FIX REAL)
       evitamos depender del RPC roto
    ========================= */
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        campaign_id,
        user_email,
        amount,
        currency: "CLP",
        type: "payment",
        status: "confirmed",
        flow_type: "in",
        payment_id: paymentId,
        provider: "mercadopago",
        created_at: new Date().toISOString()
      })

    if (ledgerError) {
      console.error("❌ LEDGER ERROR:", ledgerError)
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 UPDATE CAMPAIGN (🔥 CLAVE)
    ========================= */
    await supabase.rpc("increment_campaign_amount", {
      campaign_id_input: campaign_id,
      amount_input: amount
    })

    /* =========================
       💰 WALLET SIMPLE
    ========================= */
    await supabase
      .from("wallets")
      .upsert({
        user_email,
        balance: amount,
        total_earned: amount
      }, { onConflict: "user_email" })

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email,
      type: "donation_received",
      title: "Donación confirmada",
      message: `Tu donación de $${amount} fue procesada correctamente`,
      metadata: { campaign_id, amount, message },
      sendEmail: true
    })

    console.log("✅ PAYMENT PROCESSED")

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.error("❌ WEBHOOK ERROR:", error)

    await sendAlert({
      title: "Webhook error",
      message: "Error procesando pago",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}