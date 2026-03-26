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
  try {
    const url = new URL(req.url)

    // =========================
    // 🌐 IP + DEVICE (ANTIFRAUDE)
    // =========================
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const device =
      req.headers.get("user-agent") || "unknown"

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    if (!paymentId) {
      const body = await req.json().catch(() => null)
      paymentId = body?.data?.id
    }

    console.log("📩 PAYMENT ID:", paymentId)

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (error) {
      console.log("⚠️ Payment no encontrado (normal)")
      return NextResponse.json({ ok: true })
    }

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    // 🎯 CAMPAÑA
    const campaign_id =
      payment.metadata?.campaign_id ||
      payment.external_reference ||
      null

    if (!campaign_id) {
      console.log("❌ Sin campaign_id")
      return NextResponse.json({ ok: true })
    }

    // 📧 EMAIL
    let user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      null

    if (!user_email) {
      user_email = `guest_${payment.id}@impulsasuenos.com`
    }

    const amount = Number(payment.transaction_amount || 0)

    // =========================
    // 🛡️ REGISTRO ACTIVIDAD
    // =========================
    await supabase.from("fraud_logs").insert({
      user_email,
      ip,
      device,
      action: "payment"
    })

    // =========================
    // 🚨 DETECTAR MULTICUENTAS
    // =========================
    const { data: sameIpUsers } = await supabase
      .from("fraud_logs")
      .select("user_email")
      .eq("ip", ip)

    const uniqueUsers = [
      ...new Set(sameIpUsers?.map(u => u.user_email))
    ]

    if (uniqueUsers.length > 3) {
      console.log("🚨 MULTICUENTA DETECTADA")

      await supabase.from("fraud_logs").insert({
        user_email,
        ip,
        device,
        action: "multi_account_detected",
        risk_level: "high"
      })
    }

    // =========================
    // ⚙️ COMISIÓN DINÁMICA
    // =========================
    let commissionRate = 0.1

    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "commission_rate")
      .maybeSingle()

    if (setting?.value) {
      commissionRate = Number(setting.value)
    }

    const commission = amount * commissionRate
    const netAmount = amount - commission

    console.log("💰 TOTAL:", amount)
    console.log("💸 NETO:", netAmount)
    console.log("🏦 COMISIÓN:", commission)

    // 🔒 ANTIDUPLICADO
    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle()

    if (existing) {
      console.log("⚠️ Pago duplicado")
      return NextResponse.json({ ok: true })
    }

    // 👤 OWNER
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    const owner_email = campaign?.user_email

    // =========================
    // 🚫 BLOQUEO AUTO-COMPRA
    // =========================
    if (owner_email === user_email) {
      console.log("🚨 AUTO COMPRA BLOQUEADA")

      await supabase.from("fraud_logs").insert({
        user_email,
        ip,
        device,
        action: "self_purchase_blocked",
        risk_level: "high"
      })

      return NextResponse.json({ ok: true })
    }

    // 💰 DONACIÓN
    await supabase.from("donations").insert({
      campaign_id,
      amount,
      payment_id: payment.id,
      user_email,
    })

    // 🧾 COMPRA
    await supabase.from("transactions").insert({
      user_email,
      type: "purchase",
      amount,
      status: "completed",
      reference_id: campaign_id
    })

    if (owner_email) {

      // 💰 WALLET (NETO)
      await supabase.rpc("add_balance", {
        user_email_input: owner_email,
        amount_input: netAmount
      })

      // 🧾 DEPÓSITO
      await supabase.from("transactions").insert({
        user_email: owner_email,
        type: "deposit",
        amount: netAmount,
        status: "completed",
        reference_id: payment.id
      })
    }

    // 💰 COMISIÓN
    await supabase.rpc("add_balance", {
      user_email_input: "platform@impulsasuenos.com",
      amount_input: commission
    })

    await supabase.from("transactions").insert({
      user_email: "platform@impulsasuenos.com",
      type: "commission",
      amount: commission,
      status: "completed",
      reference_id: payment.id
    })

    // 🎟️ TICKETS
    const ticketPrice = 1000
    const quantity = Math.floor(amount / ticketPrice)

    if (quantity > 0) {

      const { data: lastTicket } = await supabase
        .from("tickets")
        .select("ticket_number")
        .eq("campaign_id", campaign_id)
        .order("ticket_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      let start = lastTicket?.ticket_number || 0

      const tickets = []

      for (let i = 1; i <= quantity; i++) {
        tickets.push({
          campaign_id,
          payment_id: payment.id,
          ticket_number: start + i,
          user_email,
        })
      }

      await supabase.from("tickets").insert(tickets)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR WEBHOOK:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
