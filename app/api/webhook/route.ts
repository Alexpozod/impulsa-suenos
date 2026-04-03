import { NextResponse } from "next/server"
import crypto from "crypto"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { processPaymentAccounting } from "@/lib/finance/processPaymentAccounting"
import { evaluateFraud } from "@/lib/fraud/engine"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { logToDB, logErrorToDB } from "@/lib/logToDB"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
   🚀 WEBHOOK PRO
========================= */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    if (!paymentId) return NextResponse.json({ ok: true })

    /* 🔐 firma */
    if (!verifySignature(req)) {
      await logErrorToDB("invalid_signature", { paymentId })
      return NextResponse.json({ ok: true })
    }

    /* 🛑 idempotencia */
    const { data: existing } = await supabase
      .from("processed_payments")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existing) {
      await logToDB("info", "duplicate_webhook", { paymentId })
      return NextResponse.json({ ok: true })
    }

    /* 🔒 lock */
    const lockKey = crypto.createHash("md5").update(paymentId).digest("hex")

    await supabase.rpc("advisory_lock", { lock_key: lockKey })

    /* 🔁 doble check */
    const { data: existsAfterLock } = await supabase
      .from("processed_payments")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existsAfterLock) return NextResponse.json({ ok: true })

    /* 💳 obtener pago */
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (error) {
      await sendAlert({
        title: "Webhook MP error",
        message: "No se pudo obtener pago",
        data: { paymentId }
      })

      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      await logToDB("info", "payment_not_approved", { paymentId })
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

    /* 🔥 VALIDACIÓN FINANCIERA */
    const expected = amount + platform_tip

    if (Math.abs(totalPaid - expected) > 1) {
      await sendAlert({
        title: "Monto inconsistente",
        message: "Posible manipulación",
        data: {
          paymentId,
          totalPaid,
          expected
        }
      })

      return NextResponse.json({ ok: true })
    }

    if (!campaign_id) return NextResponse.json({ ok: true })

    /* 📝 marcar procesado */
    await supabase.from("processed_payments").insert({
      payment_id: paymentId,
    })

    /* 💰 CONTABILIDAD */
    try {
      await processPaymentAccounting({
        paymentId,
        campaign_id,
        user_email,
        amount,
        platform_tip,
      })
    } catch (error) {
      await logErrorToDB("ledger_error", { paymentId, error })

      await sendAlert({
        title: "ERROR CONTABLE CRÍTICO",
        message: "Fallo en ledger",
        data: { paymentId }
      })
    }

    /* 🚨 ANTIFRAUDE */
    try {
      await evaluateFraud(user_email)
    } catch (error) {
      await logErrorToDB("fraud_error", { user_email })

      await sendAlert({
        title: "Fraud engine error",
        message: "Falló antifraude",
        data: { user_email }
      })
    }

    await logToDB("info", "webhook_success", {
      paymentId,
      campaign_id
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    await logErrorToDB("webhook_fatal_error", error)

    await sendAlert({
      title: "Webhook crítico",
      message: "Fallo total webhook",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}