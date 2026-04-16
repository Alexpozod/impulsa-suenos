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
       🔒 ID EMPOTENTE
    ========================= */
    const { data: exists } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (exists) return NextResponse.json({ ok: true })

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

    const campaign_id = payment.metadata?.campaign_id
    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email

    const gross = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)
    const message = payment.metadata?.message || ""

    if (!campaign_id || !user_email) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🧠 METADATA NORMALIZADA
    ========================= */
    const metadata = {
      message,
      tip,
      gross
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
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔔 NOTIFICACIÓN (UNA SOLA VEZ)
    ========================= */
    await sendNotification({
      user_email,
      type: "donation",
      title: "Donación recibida",
      message: `Recibiste $${gross - tip}`,
      metadata,
      sendEmail: true
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