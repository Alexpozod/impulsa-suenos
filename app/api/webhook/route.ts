import { NextResponse } from "next/server"
import crypto from "crypto"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { sendTicketEmail } from "@/lib/email"
import { evaluateFraud } from "@/lib/fraud/engine"
import { processPaymentAccounting } from "@/lib/finance/processPaymentAccounting"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📊 AUDIT LOGGER
========================= */
async function logEvent(paymentId: string, event_type: string, status: string, payload?: any) {
  try {
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      event_type,
      status,
      payload: payload || null,
    })
  } catch (e) {
    console.warn("audit log failed", e)
  }
}

/* =========================
   🔐 VERIFY SIGNATURE
========================= */
function verifySignature(req: Request) {
  const signature = req.headers.get("x-signature")
  const requestId = req.headers.get("x-request-id")

  if (!signature || !requestId) return false

  const secret = process.env.MP_WEBHOOK_SECRET!
  const parts = signature.split(",")

  let ts = ""
  let v1 = ""

  for (const part of parts) {
    const [k, v] = part.split("=")
    if (k === "ts") ts = v
    if (k === "v1") v1 = v
  }

  const url = new URL(req.url)
  const dataId = url.searchParams.get("data.id")

  if (!ts || !v1 || !dataId) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`

  const hash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  return hash === v1
}

/* =========================
   🚀 WEBHOOK
========================= */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    logInfo("Webhook recibido", { paymentId })

    if (!paymentId) return NextResponse.json({ ok: true })

    if (!verifySignature(req)) {
      await logEvent(paymentId, "signature_invalid", "error")

      await sendAlert({
        title: "Firma inválida webhook",
        message: "Intento de webhook inválido",
        data: { paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    const { data: existing } = await supabase
      .from("processed_payments")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existing) {
      await logEvent(paymentId, "duplicate_webhook", "ignored")
      return NextResponse.json({ ok: true })
    }

    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || payment.status !== "approved") {
      await logEvent(paymentId, "payment_not_approved", "ignored")
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(payment.metadata?.amount || 0)
    const platform_tip = Number(payment.metadata?.platform_tip || 0)

    const totalPaid = Number(payment.transaction_amount || 0)
    const expectedTotal = amount + platform_tip

    if (!campaign_id) return NextResponse.json({ ok: true })

    if (Math.abs(totalPaid - expectedTotal) > 1) {
      await logEvent(paymentId, "amount_mismatch", "error")

      await sendAlert({
        title: "Monto inconsistente",
        message: "Diferencia en pago detectada",
        data: { paymentId, totalPaid, expectedTotal }
      })

      return NextResponse.json({ ok: true })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email, title, user_id")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) return NextResponse.json({ ok: true })

    if (campaign.user_email === user_email) {
      await logEvent(paymentId, "self_payment", "blocked")
      return NextResponse.json({ ok: true })
    }

    await supabase.from("processed_payments").insert({
      payment_id: paymentId,
    })

    await processPaymentAccounting({
      paymentId,
      campaign_id,
      user_email,
      amount,
      platform_tip,
    })

    await evaluateFraud(user_email)

    const { data: tickets } = await supabase
      .from("tickets")
      .select("ticket_number")
      .eq("payment_id", paymentId)

    if (tickets && tickets.length > 0) {
      await sendTicketEmail({
        to: user_email,
        tickets: tickets.map(t => t.ticket_number),
        campaign: campaign.title,
      })
    }

    await logEvent(paymentId, "webhook_completed", "success")

    return NextResponse.json({ ok: true })

  } catch (error) {
    logError("Webhook error", error)
    await logErrorToDB("webhook_error", error)

    await sendAlert({
      title: "Error webhook",
      message: "Webhook falló",
      data: { error }
    })

    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}