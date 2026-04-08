import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

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

    let paymentId = null

    // 🔥 leer body correctamente
    try {
      const body = await req.json()
      console.log("📩 BODY:", body)

      paymentId = body?.data?.id || body?.id || null

    } catch {
      console.log("⚠️ NO BODY")
    }

    // 🔥 fallback URL (por si viene por query)
    if (!paymentId) {
      const url = new URL(req.url)
      paymentId =
        url.searchParams.get("data.id") ||
        url.searchParams.get("id")
    }

    if (!paymentId) {
      console.log("❌ NO PAYMENT ID")
      return NextResponse.json({ ok: true })
    }

    console.log("💳 PAYMENT ID:", paymentId)

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err) {
      console.log("❌ PAYMENT NOT FOUND (IGNORADO)")
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      console.log("⚠️ NO APROBADO")
      return NextResponse.json({ ok: true })
    }

    const amount = Number(payment.transaction_amount || 0)

    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    console.log("💵 AMOUNT:", amount)
    console.log("🎯 CAMPAIGN:", campaign_id)

    if (!campaign_id || !amount) {
      console.log("❌ DATOS INVALIDOS")
      return NextResponse.json({ ok: true })
    }

    // 🔥 RPC
    const { data, error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: 0,
      p_provider: "mercadopago"
    })

    if (error) {
      console.log("❌ RPC ERROR:", error)
      return NextResponse.json({ ok: true })
    }

    if (data?.status === "already_processed") {
      console.log("⚠️ DUPLICADO IGNORADO")
      return NextResponse.json({ ok: true })
    }

    console.log("✅ PAYMENT OK")

    return NextResponse.json({ ok: true })

  } catch (err) {

    console.log("🔥 ERROR GENERAL:", err)

    return NextResponse.json({ ok: true })
  }
}