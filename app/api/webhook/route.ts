import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendDonationEmail } from "@/lib/email"
import { logSystemEvent } from "@/lib/system/logger"
import { sendAlert } from "@/lib/alerts/sendAlert"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  console.log("🔥 WEBHOOK HIT")

  try {

    /* =========================
       🔐 SEGURIDAD (UA + IP)
    ========================= */
    const userAgent = req.headers.get("user-agent") || ""

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      ""

    const allowedIps = [
      "127.0.0.1", // dev
      "3.",        // ejemplo rango (puedes ajustar luego)
      "34.",
      "52."
    ]

    const isAllowedIP = allowedIps.some(a => ip.includes(a))

    if (
      !userAgent.toLowerCase().includes("mercadopago") &&
      !isAllowedIP
    ) {
      console.log("⛔ webhook bloqueado", { ip, userAgent })

      await logSystemEvent({
        type: "webhook_blocked",
        severity: "warning",
        message: "Intento webhook no autorizado",
        metadata: { ip, userAgent }
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🧾 OBTENER PAYMENT ID
    ========================= */
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

    console.log("💳 PAYMENT ID:", paymentId)

    /* =========================
       🔒 IDEMPOTENCIA
    ========================= */
    const { data: existing } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("type", "payment")
      .maybeSingle()

    if (existing) {

      await logSystemEvent({
        type: "payment_duplicate",
        severity: "warning",
        message: "Pago duplicado evitado",
        metadata: { paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       💳 OBTENER PAGO MP
    ========================= */
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err) {

      await logSystemEvent({
        type: "payment_fetch_error",
        severity: "critical",
        message: "Error obteniendo pago",
        metadata: { paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       📦 METADATA
    ========================= */
    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount =
      Number(payment.transaction_amount) ||
      Number(payment.metadata?.amount || 0)

    const tip = Number(payment.metadata?.tip || 0)

    if (!campaign_id) {

      await logSystemEvent({
        type: "payment_no_campaign",
        severity: "critical",
        message: "Pago sin campaign_id",
        metadata: { paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    // 🔐 VALIDACIÓN NUEVA (NO ROMPE NADA)
    const { data: campaignExists } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaignExists) {

      await logSystemEvent({
        type: "invalid_campaign_payment",
        severity: "critical",
        message: "Pago con campaign inválida",
        metadata: { campaign_id, paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 PROCESAMIENTO
    ========================= */
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: 0,
      p_platform_fee: Math.round(300 * 1.19),
      p_provider: "mercadopago",
      p_tip: tip
    })

    if (error) {

      await logSystemEvent({
        type: "payment_error",
        severity: "critical",
        message: "Error procesando pago",
        metadata: { paymentId, error }
      })

      await sendAlert({
        title: "Error pago",
        message: "Fallo en webhook",
        data: { paymentId }
      })

    } else {

      await logSystemEvent({
        type: "payment_success",
        severity: "info",
        message: "Pago procesado",
        metadata: { paymentId, amount, campaign_id }
      })

      console.log("✅ PAYMENT REGISTERED")
    }

    /* =========================
       📧 EMAIL
    ========================= */
    try {

      const isDev = process.env.NODE_ENV !== "production"

      const emailTo = isDev
        ? process.env.ADMIN_EMAIL
        : user_email

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title")
        .eq("id", campaign_id)
        .maybeSingle()

      await sendDonationEmail({
        to: emailTo,
        campaign: campaign?.title || "donación",
        amount
      })

    } catch (err) {

      await logSystemEvent({
        type: "email_error",
        severity: "warning",
        message: "Error enviando email",
        metadata: { paymentId }
      })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {

    await logSystemEvent({
      type: "webhook_crash",
      severity: "critical",
      message: "Error general webhook",
      metadata: { error }
    })

    return NextResponse.json({ ok: true })
  }
}