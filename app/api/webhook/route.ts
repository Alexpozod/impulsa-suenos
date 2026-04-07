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

    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id
    const user_email = payment.metadata?.user_email

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

    // 🎟️ ticket simple
    const ticketCode = Math.floor(100000 + Math.random() * 900000).toString()

    await supabase.from("tickets").insert([{
      campaign_id,
      payment_id: paymentId,
      user_email,
      ticket_number: ticketCode
    }])

    // 📧 email
    await sendTicketEmail({
      to: user_email,
      ticket: ticketCode,
      campaign: "Campaña",
      amount
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json({ ok: true })
  }
}