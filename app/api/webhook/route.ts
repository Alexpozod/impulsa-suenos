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

    /* =========================
       🔒 VALIDACIÓN BÁSICA ORIGEN
    ========================= */
    const userAgent = req.headers.get("user-agent") || ""

    if (!userAgent.toLowerCase().includes("mercadopago")) {
      console.log("⛔ webhook bloqueado")
      return NextResponse.json({ ok: true })
    }

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

    /* =========================
       🔒 IDEMPOTENCIA
    ========================= */
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

    /* =========================
       📦 METADATA
    ========================= */
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

    /* =========================
       💰 PROCESAMIENTO ATÓMICO
    ========================= */
    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_fee_mp: 0,
      p_platform_fee: Math.round(300 * 1.19),
      p_provider: "mercadopago",
      p_tip: tip
    })

    if (error) {
      console.log("❌ RPC ERROR:", error)
    } else {
      console.log("✅ PAYMENT REGISTERED")
    }

    /* =========================
       📧 EMAIL
    ========================= */
    try {

      const isDev = process.env.NODE_ENV !== "production"

      const emailTo = isDev
        ? process.env.ADMIN_EMAIL
        : user_email

      console.log("📧 ENVIANDO EMAIL A:", emailTo)

      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title")
        .eq("id", campaign_id)
        .maybeSingle()

      await sendDonationEmail({
        to: emailTo,
        campaign: campaign?.title || "donación",
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