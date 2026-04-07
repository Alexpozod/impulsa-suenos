import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendTicketEmail } from "@/lib/email"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🎯 generar ticket tipo CANJU-XXXXXX
function generateTicketCode(title: string) {
  const prefix = title
    ?.replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 5) || "TICK"

  const random = Math.floor(100000 + Math.random() * 900000)

  return `${prefix}-${random}`
}

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

    console.log("💳 PAYMENT:", paymentId)

    // 🚫 BLOQUEO REAL (CLAVE)
    const { data: existingTicket } = await supabase
      .from("tickets")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existingTicket) {
      console.log("⚠️ YA PROCESADO")
      return NextResponse.json({ ok: true })
    }

    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id
    const user_email = payment.metadata?.user_email
    const amount = Number(payment.metadata?.amount || 0)
    const platform_tip = Number(payment.metadata?.platform_tip || 0)

    if (!campaign_id) return NextResponse.json({ ok: true })

    // 💰 FINANZAS
    await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
      p_provider: "mercadopago"
    })

    // 🔥 obtener nombre campaña
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    const ticketCode = generateTicketCode(campaign?.title || "ticket")

    // 🎟️ ticket
    await supabase.from("tickets").insert([{
      campaign_id,
      payment_id: paymentId,
      user_email,
      ticket_number: ticketCode
    }])

    console.log("🎟️ TICKET:", ticketCode)

    // 📧 email
    await sendTicketEmail({
      to: user_email,
      ticket: ticketCode,
      campaign: campaign?.title || "Campaña",
      amount
    })

    console.log("📧 EMAIL OK")

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.log("❌ WEBHOOK ERROR:", error)
    return NextResponse.json({ ok: true })
  }
}