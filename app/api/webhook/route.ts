console.log("🔥 WEBHOOK HIT")

import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"
import { syncWallet } from "@/lib/wallet/syncWallet"

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

    const rawBody = await req.text()

    /* =========================
       🔁 BODY
    ========================= */
    let body: any = {}
    try { body = JSON.parse(rawBody) } catch {}

    const url = new URL(req.url)

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id ||
      null

    if (!paymentId) return NextResponse.json({ ok: true })

    console.log("🆔 PAYMENT ID:", paymentId)

    /* =========================
       🔁 IDEMPOTENCIA
    ========================= */
    const eventId = `mp_${paymentId}`

    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle()

    if (existingEvent) {
      console.log("⚠️ EVENT DUPLICADO")
      return NextResponse.json({ ok: true })
    }

    await supabase.from("webhook_events").insert({
      event_id: eventId,
      payload: body,
      created_at: new Date().toISOString()
    })

    /* =========================
       💳 GET PAYMENT
    ========================= */
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔥 NORMALIZACIÓN CORRECTA
    ========================= */
    const total = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)

    const donation = total - tip

    if (donation <= 0) {
      console.warn("⚠️ donation inválida")
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id
    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email

    if (!campaign_id || !user_email) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 FEES (SOBRE DONATION)
    ========================= */
    let fee_mp = Number(payment.fee_details?.[0]?.amount || 0)

    if (!fee_mp) {
      const MP_PERCENT = 0.0415
      fee_mp = Math.round(donation * MP_PERCENT)
    }

    const PLATFORM_FIXED = 300
    const PLATFORM_PERCENT = 0.01

    console.log("🧮 CALC:", { donation, tip, fee_mp })

    /* =========================
       📝 PAYMENT LOG
    ========================= */
    await supabase.from("payments").upsert({
      payment_id: paymentId,
      campaign_id,
      user_email,
      amount: donation, // 🔥 SOLO DONACIÓN
      tip,
      status: "approved",
      metadata: {
        total,
        donation,
        tip
      }
    })

    /* =========================
       🔐 LOCK
    ========================= */
    await supabase.rpc("advisory_lock", {
      lock_key: `payment_${paymentId}`
    })

    /* =========================
       🧠 RPC CORRECTO
    ========================= */
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: donation, // 🔥 FIX CRÍTICO
      p_fee_mp: fee_mp,
      p_tip: tip,
      p_platform_fixed: PLATFORM_FIXED,
      p_platform_percent: PLATFORM_PERCENT,
      p_provider: "mercadopago"
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

      await sendAlert({
        title: "Error en RPC",
        message: "Fallo process_payment_atomic",
        data: { paymentId, error }
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email,
      type: "donation",
      title: "Donación recibida",
      message: `Recibiste $${donation}`,
      sendEmail: true
    })

    /* =========================
       🔄 WALLET
    ========================= */
    await syncWallet(user_email)

    console.log("✅ PAYMENT PROCESADO")

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("🔥 WEBHOOK ERROR:", error)

    await sendAlert({
      title: "Webhook error",
      message: "Error procesando pago",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}