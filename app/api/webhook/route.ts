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

    /* =========================
       🔐 VALIDACIÓN FIRMA (SAFE MODE)
    ========================= */
    const signature = req.headers.get("x-signature")
    const requestId = req.headers.get("x-request-id")

    const rawBody = await req.text()

    if (process.env.WEBHOOK_SECRET && signature && requestId) {

      try {
        const parts = signature.split(",")

        const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1]
        const hash = parts.find(p => p.startsWith("v1="))?.split("=")[1]

        if (!ts || !hash) {
          console.warn("⚠️ Invalid signature format")
          return NextResponse.json({ ok: true })
        }

        const url = new URL(req.url)

        const paymentId =
          url.searchParams.get("data.id") ||
          url.searchParams.get("id")

        const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`

        const expected = crypto
          .createHmac("sha256", process.env.WEBHOOK_SECRET)
          .update(manifest)
          .digest("hex")

        if (expected !== hash) {
          console.warn("⚠️ Signature mismatch")
          return NextResponse.json({ ok: true })
        }

      } catch (err) {
        console.warn("⚠️ Signature validation error", err)
        return NextResponse.json({ ok: true })
      }
    }

    /* =========================
       🔁 PARSE BODY
    ========================= */
    let body: any = {}
    try {
      body = JSON.parse(rawBody)
    } catch {}

    const url = new URL(req.url)

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id ||
      null

    if (!paymentId) return NextResponse.json({ ok: true })

    /* =========================
       🔁 IDEMPOTENCIA GLOBAL
    ========================= */
    const eventId =
      req.headers.get("x-request-id") ||
      req.headers.get("x-event-id") ||
      `mp_${paymentId}`

    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle()

    if (existingEvent) {
      return NextResponse.json({ ok: true })
    }

    await supabase.from("webhook_events").insert({
      event_id: eventId,
      payload: body,
      created_at: new Date().toISOString()
    })

    /* =========================
       🧾 LOG INICIAL
    ========================= */
    await supabase.from("webhook_logs").insert({
      payment_id: paymentId,
      payload: { received: true },
      status: "received"
    })

    /* =========================
       🔒 IDEMPOTENCIA PAYMENT
    ========================= */
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existingPayment?.status === "approved") {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💳 GET PAYMENT
    ========================= */
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (error) {
      console.warn("⚠️ Payment not found yet:", paymentId)
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🛡️ ANTIFRAUDE (NO BLOQUEANTE)
    ========================= */
    try {

      const timeWindow = new Date(Date.now() - 60 * 1000).toISOString()

      const { data: recentPayments } = await supabase
        .from("payments")
        .select("id, amount, created_at")
        .eq("user_email", payment.metadata?.user_email || payment.payer?.email)
        .gte("created_at", timeWindow)

      const count = recentPayments?.length || 0

      if (count >= 5) {
        await sendAlert({
          title: "🚨 Posible fraude",
          message: "Muchos pagos en corto tiempo",
          data: {
            user_email: payment.metadata?.user_email,
            count,
            paymentId
          }
        })
      }

      if (Number(payment.transaction_amount) > 500000) {
        await sendAlert({
          title: "🚨 Pago alto sospechoso",
          message: "Monto elevado detectado",
          data: {
            user_email: payment.metadata?.user_email,
            amount: payment.transaction_amount,
            paymentId
          }
        })
      }

    } catch (err) {
      console.warn("antifraud check failed", err)
    }

    /* =========================
       🔍 VALIDACIONES EXTRA
    ========================= */
    if (Number(payment.transaction_amount) <= 0) {
      console.warn("⚠️ Invalid amount")
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
       💰 NORMALIZACIÓN
    ========================= */
    const grossRaw = Number(payment.transaction_amount || 0)
    const tipRaw = Number(payment.metadata?.tip || 0)

    const gross = Math.max(grossRaw, 0)
    const tip = Math.min(Math.max(tipRaw, 0), gross)
    const net = gross - tip

    const message = payment.metadata?.message || ""

    const metadata = {
      message,
      tip,
      gross,
      amount: net
    }

    /* =========================
       📝 REGISTRO PREVIO
    ========================= */
    if (!existingPayment) {
      await supabase.from("payments").insert({
        payment_id: paymentId,
        campaign_id,
        user_email,
        amount: gross,
        tip,
        status: "processing",
        metadata,
        notified: false
      })
    }

    /* =========================
       🔐 LOCK
    ========================= */
    await supabase.rpc("advisory_lock", {
      lock_key: `payment_${paymentId}`
    })

    /* =========================
       🧠 PROCESAMIENTO
    ========================= */
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: gross,
      p_tip: tip,
      p_metadata: metadata
    })

    if (error) {
      console.error("RPC ERROR:", error)

      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("payment_id", paymentId)

      await sendAlert({
        title: "Error en RPC",
        message: "Fallo process_payment_atomic",
        data: { paymentId, error }
      })

      await supabase.from("webhook_logs").insert({
        payment_id: paymentId,
        payload: { error },
        status: "failed"
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       ✅ STATUS
    ========================= */
    await supabase
      .from("payments")
      .update({ status: "approved" })
      .eq("payment_id", paymentId)

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    const { data: updated } = await supabase
      .from("payments")
      .update({ notified: true })
      .eq("payment_id", paymentId)
      .eq("notified", false)
      .select()
      .maybeSingle()

    if (updated) {
      await sendNotification({
        user_email,
        type: "donation",
        title: "Donación recibida",
        message: `Recibiste $${net}`,
        metadata,
        sendEmail: true
      })
    }

    /* =========================
       📧 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", campaign_id)
      .single()

    if (campaign?.user_email) {
      await sendNotification({
        user_email: campaign.user_email,
        type: "donation_received",
        title: "Nueva donación",
        message: `Recibiste $${net}`,
        metadata,
        sendEmail: true
      })
    }

    /* =========================
       🔄 WALLET
    ========================= */
    await syncWallet(user_email)

    /* =========================
       🧾 LOG FINAL
    ========================= */
    await supabase.from("webhook_logs").insert({
      payment_id: paymentId,
      payload: { success: true },
      status: "approved"
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("WEBHOOK ERROR:", error)

    await sendAlert({
      title: "Webhook error",
      message: "Error procesando pago",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}