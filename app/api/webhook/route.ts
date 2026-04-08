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

    let paymentId: string | null = null

    // 🔍 leer body
    try {
      const body = await req.json()
      console.log("📩 BODY:", body)

      paymentId = body?.data?.id || body?.id || null

    } catch {
      console.log("⚠️ NO BODY")
    }

    // 🔍 fallback query params
    if (!paymentId) {
      const url = new URL(req.url)
      paymentId =
        url.searchParams.get("data.id") ||
        url.searchParams.get("id")
    }

    if (!paymentId) {
      console.log("❌ NO PAYMENT ID")
      return NextResponse.json({ ok: false })
    }

    console.log("💳 PAYMENT ID:", paymentId)

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err) {
      console.log("❌ PAYMENT NOT FOUND")
      
      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: "payment_not_found",
        payload: err
      })

      return NextResponse.json({ ok: false })
    }

    if (!payment || payment.status !== "approved") {
      console.log("⚠️ PAYMENT NO APROBADO")

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: payment?.status || "not_approved",
        payload: payment
      })

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

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "invalid_data",
        payload: payment
      })

      return NextResponse.json({ ok: false })
    }

    // 🔥 RPC CORE
    const { data, error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: 0,
      p_provider: "mercadopago"
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "rpc_error",
        payload: error
      })

      return NextResponse.json({ ok: false })
    }

    // 🔁 duplicado (normal en MercadoPago)
    if (data?.status === "already_processed" || data?.status === "already_processed_after_lock") {
      console.log("⚠️ DUPLICADO IGNORADO")

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "duplicate",
        payload: payment
      })

      return NextResponse.json({ ok: true })
    }

    if (data?.status === "invalid_campaign") {
      console.log("❌ CAMPAÑA INVALIDA")

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "invalid_campaign",
        payload: payment
      })

      return NextResponse.json({ ok: false })
    }

    // ✅ SUCCESS REAL
    console.log("✅ PAYMENT OK")

    await supabase.from("payment_logs").insert({
      payment_id: paymentId,
      campaign_id,
      status: "success",
      payload: payment
    })

    // 📧 EMAIL
    try {
      await sendDonationEmail({
        to: user_email,
        campaign: campaign_id,
        amount
      })
    } catch (err) {
      console.log("⚠️ ERROR EMAIL:", err)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {

    console.error("🔥 ERROR GENERAL:", err)

    return NextResponse.json({ ok: false })
  }
}