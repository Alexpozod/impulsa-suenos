import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { evaluateFraud } from "@/lib/fraud/engine"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendTicketEmail } from "@/lib/email"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateTicketCode(campaignName: string) {
  const prefix = campaignName
    ?.replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6) || "TICKET"

  const random = Math.floor(100000 + Math.random() * 900000)

  return `${prefix}-${random}`
}

export async function POST(req: Request) {

  console.log("🔥 WEBHOOK HIT")

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

    console.log("💳 PAYMENT ID:", paymentId)

    // 🔒 CHECK SI YA EXISTE (CLAVE REAL)
    const { data: existingPayment } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("type", "payment")
      .maybeSingle()

    if (existingPayment) {
      console.log("⚠️ PAYMENT YA PROCESADO → SALIENDO")
      return NextResponse.json({ ok: true })
    }

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      console.log("❌ ERROR OBTENIENDO PAGO")
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      console.log("⚠️ PAGO NO APROBADO")
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(payment.metadata?.amount || 0)
    const platform_tip = Number(payment.metadata?.platform_tip || 0)

    if (!campaign_id) return NextResponse.json({ ok: true })

    // 💰 REGISTRO FINANCIERO (AHORA NO FALLA)
    const { error: rpcError } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
      p_provider: "mercadopago"
    })

    if (rpcError) {
      console.log("❌ RPC ERROR:", rpcError)
      return NextResponse.json({ ok: true })
    }

    console.log("✅ PAYMENT REGISTRADO")

    // 🔥 obtener campaña
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    const campaignName = campaign?.title || "ticket"

    // 🎟️ ticket
    const ticketCode = generateTicketCode(campaignName)

    const { error: ticketError } = await supabase
      .from("tickets")
      .insert([{
        campaign_id,
        payment_id: paymentId,
        user_email,
        ticket_number: ticketCode
      }])

    if (ticketError) {
      console.log("❌ ERROR TICKET:", ticketError)
    } else {
      console.log("🎟️ TICKET:", ticketCode)

      // 📧 SOLO SI SE CREÓ
      try {
        await sendTicketEmail({
          to: user_email,
          ticket: ticketCode,
          campaign: campaignName,
          amount
        })
        console.log("📧 EMAIL OK")
      } catch (err) {
        console.log("❌ ERROR EMAIL:", err)
      }
    }

    try {
      await evaluateFraud(user_email)
    } catch {}

    await logToDB("info", "webhook_success", {
      paymentId,
      campaign_id
    })

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.log("🔥 WEBHOOK ERROR:", error)

    await logErrorToDB("webhook_fatal", error)

    await sendAlert({
      title: "Webhook fatal",
      message: "Error total",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}