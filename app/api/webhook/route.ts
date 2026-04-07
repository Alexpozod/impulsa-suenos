import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

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

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // 🔥 1. QUERY PARAMS
    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    // 🔥 2. BODY (CLAVE REAL)
    if (!paymentId) {
      try {
        const body = await req.json()

        paymentId =
          body?.data?.id ||
          body?.id ||
          null

      } catch {
        // body vacío o no JSON
      }
    }

    if (!paymentId) {
      await logErrorToDB("missing_payment_id", { url: req.url })
      return NextResponse.json({ ok: true })
    }

    // 🔥 Obtener pago desde MP
    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      await sendAlert({
        title: "MP error",
        message: "No se pudo obtener pago",
        data: { paymentId }
      })
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(payment.metadata?.amount || 0)
    const platform_tip = Number(payment.metadata?.platform_tip || 0)

    if (!campaign_id) {
      await logErrorToDB("missing_campaign_id", { paymentId })
      return NextResponse.json({ ok: true })
    }

    // 🔥 INSERT FINANCIERO
    const { data, error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
      p_provider: "mercadopago"
    })

    if (error) {
      await logErrorToDB("rpc_error", error)

      await sendAlert({
        title: "ERROR FINANCIERO",
        message: "RPC falló",
        data: { paymentId }
      })
    }

    // antifraude
    try {
      await evaluateFraud(user_email)
    } catch {
      await logErrorToDB("fraud_error", { user_email })
    }

    await logToDB("info", "webhook_success", {
      paymentId,
      campaign_id,
      result: data
    })

    return NextResponse.json({ ok: true })

  } catch (error) {

    await logErrorToDB("webhook_fatal", error)

    await sendAlert({
      title: "Webhook fatal",
      message: "Error total",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}