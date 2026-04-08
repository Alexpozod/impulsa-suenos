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

    // 📩 Leer body
    try {
      const body = await req.json()
      console.log("📩 BODY:", body)
      paymentId = body?.data?.id || body?.id || null
    } catch {
      console.log("⚠️ NO BODY")
    }

    // 🔍 fallback query
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

    // 🔍 Obtener pago desde MP
    let payment
    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err) {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: "payment_not_found",
        payload: err
      })

      return NextResponse.json({ ok: false })
    }

    if (!payment || payment.status !== "approved") {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        status: payment?.status || "not_approved",
        payload: payment
      })

      return NextResponse.json({ ok: true })
    }

    // 💰 DATOS BASE
    const amount = Number(payment.transaction_amount || 0)
    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.payer?.email ||
      payment.metadata?.user_email ||
      `guest_${payment.id}@impulsasuenos.com`

    const tip = Number(payment.metadata?.tip || 0)

    // 💸 comisión MercadoPago REAL
    const fee_mp =
      payment.fee_details?.reduce(
        (acc: number, f: any) => acc + Number(f.amount || 0),
        0
      ) || 0

    // 💸 comisión TUYA (300 + IVA)
    const platform_fee = Math.round(300 * 1.19)

    console.log("💵 amount:", amount)
    console.log("💸 fee_mp:", fee_mp)
    console.log("🏢 platform_fee:", platform_fee)
    console.log("🎁 tip:", tip)

    if (!campaign_id || !amount) {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "invalid_data",
        payload: payment
      })

      return NextResponse.json({ ok: false })
    }

    // 🔥 RPC PRINCIPAL
    const { data, error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: fee_mp,
      p_platform_fee: platform_fee,
      p_provider: "mercadopago"
    })

    if (error) {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "rpc_error",
        payload: error
      })

      return NextResponse.json({ ok: false })
    }

    // 🔁 duplicados (normal)
    if (
      data?.status === "already_processed" ||
      data?.status === "already_processed_after_lock"
    ) {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "duplicate",
        payload: payment
      })

      return NextResponse.json({ ok: true })
    }

    if (data?.status === "invalid_campaign") {

      await supabase.from("payment_logs").insert({
        payment_id: paymentId,
        campaign_id,
        status: "invalid_campaign",
        payload: payment
      })

      return NextResponse.json({ ok: false })
    }

    // 🎁 TIP (extra para plataforma)
    if (tip > 0) {
      await supabase.from("financial_ledger").insert({
        campaign_id,
        type: "tip",
        flow_type: "in",
        amount: tip,
        status: "confirmed",
        provider: "mercadopago",
        payment_id: paymentId,
        user_email
      })
    }

    // ✅ LOG FINAL
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
      console.log("⚠️ EMAIL ERROR:", err)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {

    console.error("🔥 ERROR GENERAL:", err)

    return NextResponse.json({ ok: false })
  }
}