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

    if (!paymentId) {
      console.log("❌ NO PAYMENT ID")
      return NextResponse.json({ ok: true })
    }

    console.log("💳 PAYMENT ID:", paymentId)

    const payment = await paymentClient.get({ id: paymentId })

    console.log("📦 PAYMENT:", JSON.stringify(payment, null, 2))

    if (!payment || payment.status !== "approved") {
      console.log("⚠️ NOT APPROVED")
      return NextResponse.json({ ok: true })
    }

    // 🔥 MONTO REAL
    const amount = Number(payment.transaction_amount || 0)

    // 🔥 EMAIL REAL
    const user_email =
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    // 🔥 CRÍTICO: BUSCAR CAMPAÑA DESDE BASE DE DATOS
    const { data: lastCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!lastCampaign) {
      console.log("❌ NO CAMPAIGN FOUND")
      return NextResponse.json({ ok: true })
    }

    const campaign_id = lastCampaign.id

    console.log("🎯 CAMPAIGN:", campaign_id)
    console.log("💵 AMOUNT:", amount)

    if (!amount || amount <= 0) {
      console.log("❌ INVALID AMOUNT")
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
      console.log("⚠️ DUPLICATE IGNORED")
      return NextResponse.json({ ok: true })
    }

    console.log("✅ DONE")

    return NextResponse.json({ ok: true })

  } catch (err) {

    console.log("🔥 ERROR:", err)

    return NextResponse.json({ ok: true })
  }
}