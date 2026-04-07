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

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      console.log("❌ ERROR OBTENIENDO PAGO")
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

    if (!campaign_id) return NextResponse.json({ ok: true })

    // 💰 REGISTRO FINANCIERO
    await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
      p_provider: "mercadopago"
    })

    // 🔥 obtener campaña
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    const campaignName = campaign?.title || "ticket"

    // 🚫 FIX REAL: INSERT CON PROTECCIÓN
    const ticketCode = generateTicketCode(campaignName)

    const { data: inserted, error: ticketError } = await supabase
      .from("tickets")
      .upsert(
        [{
          campaign_id,
          payment_id: paymentId,
          user_email,
          ticket_number: ticketCode
        }],
        {
          onConflict: "payment_id" // 🔥 CLAVE
        }
      )
      .select()
      .single()

    if (ticketError) {
      console.log("❌ ERROR TICKET:", ticketError)
      return NextResponse.json({ ok: true })
    }

    console.log("🎟️ TICKET FINAL:", inserted.ticket_number)

    // 📧 SOLO ENVÍA EMAIL SI ES NUEVO
    if (inserted) {
      try {
        await sendTicketEmail({
          to: user_email,
          ticket: inserted.ticket_number,
          campaign: campaignName,
          amount
        })

        console.log("📧 EMAIL ENVIADO")
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