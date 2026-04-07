import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

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

    // 🔥 SOLO ESTO
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
      p_provider: "mercadopago"
    })

    if (error) {
      console.log("❌ RPC ERROR:", error)
    } else {
      console.log("✅ PAYMENT REGISTERED")
    }

    await logToDB("info", "webhook_success", {
      paymentId,
      campaign_id
    })

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.log("🔥 WEBHOOK ERROR:", error)

    await logErrorToDB("webhook_fatal", error)

    return NextResponse.json({ ok: true })
  }
}