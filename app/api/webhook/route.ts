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
       🔒 IDPOTENCIA REAL
    ========================= */
    const { data: existing } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("type", "payment")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 PAYMENT
    ========================= */
    const payment = await paymentClient.get({ id: paymentId })

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

    const donationAmount = gross - tip

    if (!campaign_id || !user_email) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💾 LOG (SIN DUPLICADOS)
    ========================= */
    await supabase
      .from("payment_logs")
      .upsert({
        payment_id: paymentId,
        campaign_id,
        status: "approved",
        message,
        payload: payment,
        created_at: new Date().toISOString()
      }, { onConflict: "payment_id" })

    /* =========================
       💰 DONACIÓN (CON MESSAGE)
    ========================= */
    await supabase.from("financial_ledger").insert({
      campaign_id,
      user_email,
      amount: donationAmount,
      currency: "CLP",
      type: "payment",
      status: "confirmed",
      flow_type: "in",
      payment_id: paymentId,
      provider: "mercadopago",
      metadata: {
        message,
        original_amount: gross,
        tip
      },
      created_at: new Date().toISOString()
    })

    /* =========================
       💸 TIP
    ========================= */
    if (tip > 0) {
      await supabase.from("financial_ledger").insert({
        campaign_id,
        user_email: "platform",
        amount: tip,
        currency: "CLP",
        type: "tip",
        status: "confirmed",
        flow_type: "in",
        payment_id: paymentId,
        provider: "mercadopago",
        created_at: new Date().toISOString()
      })
    }

    /* =========================
       💸 FEE MP
    ========================= */
    const mpFee = payment.transaction_details?.net_received_amount
      ? gross - payment.transaction_details.net_received_amount
      : 0

    if (mpFee > 0) {
      await supabase.from("financial_ledger").insert({
        campaign_id,
        user_email: "system",
        amount: -Math.abs(mpFee),
        currency: "CLP",
        type: "fee_mp",
        status: "confirmed",
        flow_type: "out",
        payment_id: paymentId,
        provider: "mercadopago",
        created_at: new Date().toISOString()
      })
    }

    /* =========================
       💸 FEE PLATAFORMA
    ========================= */
    const platformFee = Math.round(300 * 1.19)

    await supabase.from("financial_ledger").insert({
      campaign_id,
      user_email: "platform",
      amount: -platformFee,
      currency: "CLP",
      type: "fee_platform",
      status: "confirmed",
      flow_type: "out",
      payment_id: paymentId,
      provider: "system",
      created_at: new Date().toISOString()
    })

    /* =========================
       📈 CAMPAIGN
    ========================= */
    await supabase.rpc("increment_campaign_amount", {
      campaign_id_input: campaign_id,
      amount_input: donationAmount
    })

    /* =========================
       💰 WALLET (SUMATORIA)
    ========================= */
    await supabase.rpc("update_wallet_after_payment", {
      p_user_email: user_email,
      p_amount: donationAmount
    })

    /* =========================
       🔔 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email,
      type: "donation",
      title: "Donación recibida",
      message: `Recibiste $${donationAmount}`,
      metadata: {
        campaign_id,
        amount: donationAmount,
        message
      },
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