console.log("🔥 WEBHOOK HIT")

import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

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
       🔁 IDEMPOTENCIA EVENTO
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
      console.log("⚠️ PAYMENT YA PROCESADO")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💳 GET PAYMENT
    ========================= */
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      console.warn("⚠️ MP no disponible aún")
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      console.log("⏳ PAYMENT NO APROBADO")
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

    /* =========================
       🧠 DONOR NAME (FIX PRO)
    ========================= */
    const donor_name =
      payment.metadata?.donor_name ||
      [payment.payer?.first_name, payment.payer?.last_name]
        .filter(Boolean)
        .join(" ") ||
      user_email?.split("@")[0] ||
      "Donador"

    if (!campaign_id || !user_email) {
      console.warn("⚠️ metadata incompleta")
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
       📝 REGISTRO PREVIO
    ========================= */
    if (!existingPayment) {
      await supabase.from("payments").insert({
        payment_id: paymentId,
        campaign_id,
        user_email,
        amount: donation,
        tip,
        status: "processing",
        metadata: {
          total,
          donation,
          tip,
          donor_name // ✅ agregado correctamente
        },
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
       🧠 RPC (NO TOCAR)
    ========================= */
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: donation,
      p_fee_mp: fee_mp,
      p_tip: tip,
      p_platform_fixed: PLATFORM_FIXED,
      p_platform_percent: PLATFORM_PERCENT,
      p_provider: "mercadopago"
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

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
       ✅ STATUS FINAL
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
        message: `Recibiste $${donation}`,
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