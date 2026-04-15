import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendDonationEmail } from "@/lib/email"
import { logSystemEvent } from "@/lib/system/logger"
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

    const { data: existing } = await supabase
      .from("financial_ledger")
      .select("id, status")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existing && existing.status === "confirmed") {
      return NextResponse.json({ ok: true })
    }

    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email

    const amount = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)

    // 🔥 NUEVO: mensaje del usuario
    const message = payment.metadata?.message || ""

    if (!campaign_id || !user_email) {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: 0,
      p_platform_fee: Math.round(300 * 1.19),
      p_provider: "mercadopago",
      p_tip: tip,
      p_message: message // 🔥 IMPORTANTE
    })

    if (!error) {

      /* =========================
         💰 WALLET
      ========================= */
      await supabase.rpc("update_wallet_after_payment", {
        p_user_email: user_email,
        p_amount: amount
      })

      /* =========================
         🔔 NOTIFICACIÓN
      ========================= */
      await sendNotification({
        user_email,
        type: "donation_received",
        title: "Donación confirmada",
        message: `Tu donación de $${amount} fue procesada correctamente`,
        metadata: { campaign_id, amount, message }, // 🔥 incluir message
        sendEmail: true
      })
    }

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