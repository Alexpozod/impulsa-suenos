import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"
import { syncWallet } from "@/lib/wallet/syncWallet"

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

    console.log("🔥 WEBHOOK HIT")

    const rawBody = await req.text()

    let body: any = {}
    try { body = JSON.parse(rawBody) } catch {}

    const url = new URL(req.url)

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id ||
      null

    if (!paymentId) return NextResponse.json({ ok: true })

    console.log("🆔 PAYMENT ID:", paymentId)

    const eventId = `mp_${paymentId}`

    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle()

    if (existingEvent) {
      console.log("⚠️ EVENT DUPLICADO")
      return NextResponse.json({ ok: true })
    }

    await supabase.from("webhook_events").insert({
      event_id: eventId,
      payload: body,
      created_at: new Date().toISOString()
    })

    await supabase.from("webhook_logs").insert({
      payment_id: paymentId,
      payload: { received: true },
      status: "received"
    })

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle()

    // 🔥 FIX DB FALLBACK
    let dbRef = existingPayment?.ref || null
    let dbSource = existingPayment?.source || null

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch {
      console.warn("⚠️ MP no disponible aún")
      return NextResponse.json({ ok: true })
    }

    if (!payment || payment.status !== "approved") {
      console.log("⏳ PAYMENT NO APROBADO")
      return NextResponse.json({ ok: true })
    }

    const total = Number(payment.transaction_amount || 0)
    const tip = Number(payment.metadata?.tip || 0)
    const donation = total - tip

    if (donation <= 0) {
      console.warn("⚠️ donation inválida")
      return NextResponse.json({ ok: true })
    }

    const campaign_id = payment.metadata?.campaign_id
    const donor_email = payment.payer?.email

    // 🔥 OBTENER CAMPAÑA (ANTES DE USAR creator_email)
const { data: campaign } = await supabase
  .from("campaigns")
  .select("title, user_email")
  .eq("id", campaign_id)
  .maybeSingle()

if (!campaign_id || !campaign?.user_email) {
  console.warn("⚠️ metadata incompleta")
  return NextResponse.json({ ok: true })
}

const creator_email = campaign.user_email
const campaignTitle = campaign.title || "Tu campaña"

    // 🔥 FIX FINAL COMPLETO (AQUÍ ESTABA EL ERROR REAL)
    const referrer =
      payment.metadata?.referrer ||
      payment.metadata?.ref ||
      body?.metadata?.ref ||
      dbRef ||
      null

    const source =
      payment.metadata?.traffic_source ||
      payment.metadata?.source ||
      body?.metadata?.source ||
      dbSource ||
      "direct"

    const donor_name =
      payment.metadata?.donor_name ||
      [payment.payer?.first_name, payment.payer?.last_name]
        .filter(Boolean)
        .join(" ") ||
      donor_email?.split("@")[0] ||
      "Donador"

    const message =
      payment.metadata?.message ||
      payment.metadata?.message_text ||
      ""

    if (existingPayment) {
      await supabase
        .from("payments")
        .update({
          ref: referrer,
          source: source,
          metadata: {
            ...existingPayment.metadata,
            donor_name,
            message,
            donation,
            referrer,
            source
          }
        })
        .eq("payment_id", paymentId)
    }

    let fee_mp = Number(payment.fee_details?.[0]?.amount || 0)

    if (!fee_mp) {
      const MP_PERCENT = 0.0415
      fee_mp = Math.round(donation * MP_PERCENT)
    }

    let PLATFORM_FIXED = 300
    let PLATFORM_PERCENT = 0.01

    try {
      const { data: config } = await supabase
        .from("platform_settings")
        .select("fee_fixed, fee_percent")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (config) {
        const fixed = Number(config.fee_fixed)
        const percent = Number(config.fee_percent)

        if (!isNaN(fixed)) PLATFORM_FIXED = fixed
        if (!isNaN(percent)) PLATFORM_PERCENT = percent
      }
    } catch {
      console.warn("⚠️ fallback config")
    }

    if (!existingPayment) {
      await supabase.from("payments").insert({
        payment_id: paymentId,
        campaign_id,
        user_email: creator_email,
        amount: donation,
        tip,
        status: "processing",
        ref: referrer,
        source: source,
        metadata: {
          total,
          donation,
          tip,
          donor_name,
          message,
          referrer,
          source
        },
        notified: false
      })
    }

    await supabase.rpc("advisory_lock", {
      lock_key: `payment_${paymentId}`
    })

    const { error } = await supabase.rpc("process_payment_atomic", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: creator_email,
      p_amount: donation,
      p_fee_mp: fee_mp,
      p_tip: tip,
      p_platform_fixed: PLATFORM_FIXED,
      p_platform_percent: PLATFORM_PERCENT,
      p_provider: "mercadopago"
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("payment_id", paymentId)

      await sendAlert({
        title: "Error en RPC",
        message: "Fallo process_payment_atomic",
        data: { paymentId, error }
      })

      return NextResponse.json({ ok: true })
    }

    await supabase
      .from("payments")
      .update({ status: "approved" })
      .eq("payment_id", paymentId)

    const { data: paymentRow } = await supabase
      .from("payments")
      .select("notified")
      .eq("payment_id", paymentId)
      .maybeSingle()

        if (!paymentRow?.notified) {

      await supabase
        .from("payments")
        .update({ notified: true })
        .eq("payment_id", paymentId)

      await sendNotification({
        user_email: creator_email,
        type: "donation_received",
        title: "💰 Nueva donación recibida",
        message: `Recibiste una donación de $${Number(donation).toLocaleString()} en "${campaignTitle}"`,
        metadata: {
          amount: donation,
          campaign_title: campaignTitle,
          donor_name,
          message
        },
        sendEmail: true
      })

      if (donor_email && donor_email !== creator_email) {
  await sendNotification({
    user_email: donor_email,
    type: "donation", // 🔥 corregido
    title: "🙏 Gracias por tu donación",
    message: `Gracias por donar $${Number(donation).toLocaleString()} a "${campaignTitle}"`,
    metadata: {
      campaign_id,
      share_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaign_id}`
    },
    sendEmail: true // 🔥 evita duplicado
  })
}
    }

    await syncWallet(creator_email)

    await supabase.from("webhook_logs").insert({
      payment_id: paymentId,
      payload: { success: true },
      status: "approved"
    })

    console.log("✅ PAYMENT PROCESADO")

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.error("🔥 WEBHOOK ERROR:", error)

    await sendAlert({
      title: "Webhook error",
      message: "Error procesando pago",
      data: { error }
    })

    return NextResponse.json({ ok: true })
  }
}