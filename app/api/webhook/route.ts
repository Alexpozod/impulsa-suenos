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
    // 🌐 IP + DEVICE
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

    if (!paymentId) return NextResponse.json({ ok: true })

    const payment = await paymentClient.get({ id: paymentId }).catch(() => null)

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    // 🎯 CAMPAÑA
    const campaign_id =
      payment.metadata?.campaign_id ||
      payment.external_reference ||
      null

    if (!campaign_id) return NextResponse.json({ ok: true })

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
    // 🚫 BLOQUEO POR RIESGO
    // =========================
    const { data: risk } = await supabase
      .from("user_risk")
      .select("*")
      .eq("user_email", user_email)
      .maybeSingle()

    if (risk?.status === "blocked") {
      console.log("🚫 USUARIO BLOQUEADO")
      return NextResponse.json({ ok: true })
    }

    // =========================
    // 🛡️ LOG ACTIVIDAD
    // =========================
    await supabase.from("fraud_logs").insert({
      user_email,
      ip,
      device,
      action: "payment"
    })

    // =========================
    // 🚨 MULTICUENTAS
    // =========================
    const { data: sameIpUsers = [] } = await supabase
      .from("fraud_logs")
      .select("user_email")
      .eq("ip", ip)

    const uniqueUsers = [...new Set(sameIpUsers.map(u => u.user_email))]

    if (uniqueUsers.length > 3) {
      await supabase.rpc("add_risk", {
        user_email_input: user_email,
        points: 25
      })

      await supabase.from("fraud_logs").insert({
        user_email,
        ip,
        device,
        action: "multi_account_detected",
        risk_level: "high"
      })
    }

    // =========================
    // ⚠️ IP MUY SOSPECHOSA
    // =========================
    if (uniqueUsers.length > 5) {
      await supabase.rpc("add_risk", {
        user_email_input: user_email,
        points: 15
      })
    }

    // =========================
    // ⏱️ MUCHOS PAGOS RAPIDOS
    // =========================
    const { data: recentPayments = [] } = await supabase
      .from("fraud_logs")
      .select("id")
      .eq("user_email", user_email)
      .gte(
        "created_at",
        new Date(Date.now() - 5 * 60 * 1000).toISOString()
      )

    if (recentPayments.length > 5) {
      await supabase.rpc("add_risk", {
        user_email_input: user_email,
        points: 20
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

    // =========================
    // 🔒 ANTIDUPLICADO
    // =========================
    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("payment_id", payment.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ ok: true })

    // =========================
    // 👤 OWNER
    // =========================
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    const owner_email = campaign?.user_email

    // =========================
    // 🚫 AUTO COMPRA
    // =========================
    if (owner_email === user_email) {

      await supabase.rpc("add_risk", {
        user_email_input: user_email,
        points: 50
      })

      await supabase.from("fraud_logs").insert({
        user_email,
        ip,
        device,
        action: "self_purchase_blocked",
        risk_level: "high"
      })

      return NextResponse.json({ ok: true })
    }

    // =========================
    // 💰 DONACIÓN
    // =========================
    await supabase.from("donations").insert({
      campaign_id,
      amount,
      payment_id: payment.id,
      user_email,
    })

    // =========================
    // 🧾 COMPRA
    // =========================
    await supabase.from("transactions").insert({
      user_email,
      type: "purchase",
      amount,
      status: "completed",
      reference_id: campaign_id
    })

    // riesgo leve por actividad
    await supabase.rpc("add_risk", {
      user_email_input: user_email,
      points: 2
    })

    // =========================
    // 💰 WALLET CAMPAÑA
    // =========================
    if (owner_email) {

      await supabase.rpc("add_balance", {
        user_email_input: owner_email,
        amount_input: netAmount
      })

      await supabase.from("transactions").insert({
        user_email: owner_email,
        type: "deposit",
        amount: netAmount,
        status: "completed",
        reference_id: payment.id
      })
    }

    // =========================
    // 💰 COMISIÓN PLATAFORMA
    // =========================
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

    // =========================
    // 🎟️ TICKETS
    // =========================
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
