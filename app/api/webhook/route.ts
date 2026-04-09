import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendDonationEmail } from "@/lib/email"

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

    console.log("💳 PAYMENT ID:", paymentId)

    // 🔒 evitar duplicados
    const { data: existing } = await supabase
      .from("financial_ledger")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("type", "payment")
      .maybeSingle()

    if (existing) {
      console.log("⚠️ YA PROCESADO")
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

    // 🔥 USAR METADATA (COMO ANTES)
    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(payment.metadata?.amount || 0)
    const tip = Number(payment.metadata?.tip || 0)

    if (!campaign_id) {
      console.log("❌ NO CAMPAIGN ID")
      return NextResponse.json({ ok: true })
    }

    // 💰 PROCESAR PAGO
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: 0,
      p_platform_fee: Math.round(300 * 1.19),
      p_provider: "mercadopago"
    })

    if (error) {
      console.log("❌ RPC ERROR:", error)
    } else {
      console.log("✅ PAYMENT REGISTERED")
    }

    // 🎁 TIP separado
    if (tip > 0) {
      await supabase
        .from("financial_ledger")
        .upsert({
          campaign_id,
          type: "tip",
          flow_type: "in",
          amount: tip,
          status: "confirmed",
          provider: "mercadopago",
          payment_id: paymentId,
          user_email
        }, {
          onConflict: "payment_id,type"
        })
    }

    // 🔥 NOMBRE CAMPAÑA
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    const campaignName = campaign?.title || "donación"

    // 📧 EMAIL (MISMA LÓGICA QUE FUNCIONABA)
    try {
      console.log("📧 ENVIANDO EMAIL A:", user_email)

      await sendDonationEmail({
        to: process.env.ADMIN_EMAIL || user_email,
        campaign: campaignName,
        amount
      })

      console.log("✅ EMAIL ENVIADO")
    } catch (err) {
      console.log("❌ ERROR EMAIL:", err)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.log("🔥 WEBHOOK ERROR:", error)

    return NextResponse.json({ ok: true })
  }
}