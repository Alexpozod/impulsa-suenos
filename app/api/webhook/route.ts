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

    if (!paymentId) return NextResponse.json({ ok: true })

    /* =========================
       🧾 LOG INICIAL
    ========================= */
    await supabase.from("webhook_logs").insert({
      payment_id: paymentId,
      payload: { received: true },
      status: "received"
    })

    /* =========================
       🔒 IDEMPOTENCIA
    ========================= */
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle()

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

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `donador_${paymentId}@anon.com`

    const grossRaw = Number(payment.transaction_amount || 0)
    const tipRaw = Number(payment.metadata?.tip || 0)

    const gross = Math.max(grossRaw, 0)
    const tip = Math.min(Math.max(tipRaw, 0), gross)

    /* =========================
       💸 COMISIONES (NUEVO)
    ========================= */
    const mpFee = Math.round(gross * 0.0349)
    const platformFee = Math.round(300 * 1.19)
    const totalFees = mpFee + platformFee

    const net = gross - totalFees

    const message = payment.metadata?.message || ""

    console.log("💰 DEBUG PAYMENT:", {
      paymentId,
      gross,
      tip,
      mpFee,
      platformFee,
      net
    })

    if (!campaign_id || !user_email) {
      return NextResponse.json({ ok: true })
    }

    const metadata = {
      message,
      tip,
      gross,
      mp_fee: mpFee,
      platform_fee: platformFee,
      total_fees: totalFees,
      net,
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
       🧠 PROCESAMIENTO CENTRAL
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
       💸 REGISTRAR COMISIONES
    ========================= */
    await supabase.from("financial_ledger").insert([
      {
        campaign_id,
        user_email: "platform",
        amount: -mpFee,
        type: "fee_mp",
        status: "confirmed",
        flow_type: "out",
        payment_id: paymentId
      },
      {
        campaign_id,
        user_email: "platform",
        amount: -platformFee,
        type: "fee_platform",
        status: "confirmed",
        flow_type: "out",
        payment_id: paymentId
      }
    ])

    /* =========================
       ✅ ACTUALIZAR ESTADO
    ========================= */
    await supabase
      .from("payments")
      .update({ status: "approved" })
      .eq("payment_id", paymentId)

    /* =========================
       🔔 NOTIFICACIÓN ATÓMICA
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