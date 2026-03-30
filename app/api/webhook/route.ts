import { NextResponse } from "next/server"
import crypto from "crypto"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { sendTicketEmail } from "@/lib/email"

export const runtime = "nodejs"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🔐 SIGNATURE CHECK (FIXED)
========================= */
function verifySignature(req: Request) {
  const signature = req.headers.get("x-signature")
  const requestId = req.headers.get("x-request-id")

  if (!signature || !requestId) return false

  const secret = process.env.MP_WEBHOOK_SECRET!
  const raw = requestId

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("hex")

  return signature === hmac
}

/* =========================
   🚀 WEBHOOK PRO
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const paymentId =
      body?.data?.id ||
      new URL(req.url).searchParams.get("data.id") ||
      new URL(req.url).searchParams.get("id")

    if (!paymentId) return NextResponse.json({ ok: true })

    /* =========================
       💳 GET PAYMENT
    ========================= */
    const payment = await paymentClient.get({ id: paymentId }).catch(() => null)

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const metadata = payment.metadata || {}

    const campaign_id = metadata.campaign_id
    const user_email =
      metadata.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(metadata.amount || 0)
    const platform_tip = Number(metadata.platform_tip || 0)
    const totalPaid = Number(payment.transaction_amount || 0)

    if (!campaign_id) return NextResponse.json({ ok: true })

    const expectedTotal = amount + platform_tip

    /* =========================
       📡 1. EVENT LOG (SIEMPRE)
    ========================= */
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      event_type: "webhook_received",
      payload: payment,
    })

    /* =========================
       🔐 2. IDEMPOTENCY STRONG CHECK
    ========================= */
    const { data: exists } = await supabase
      .from("payment_ledger")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (exists) {
      await supabase.from("payment_events").insert({
        payment_id: paymentId,
        event_type: "duplicate_blocked",
        payload: payment,
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🧠 3. FRAUD CHECK BASIC
    ========================= */
    let status: "approved" | "fraud" = "approved"
    let eventType = "verified"

    if (Math.abs(totalPaid - expectedTotal) > 1) {
      status = "fraud"
      eventType = "amount_mismatch"
    }

    /* =========================
       🚫 AUTO-COMPRA CHECK
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email, title")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) return NextResponse.json({ ok: true })

    if (campaign.user_email === user_email) {
      await supabase.from("payment_events").insert({
        payment_id: paymentId,
        event_type: "self_purchase_blocked",
        payload: payment,
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🧱 4. LEDGER INSERT (SOURCE OF TRUTH)
    ========================= */
    await supabase.from("payment_ledger").insert({
      payment_id: paymentId,
      status,

      campaign_id,
      user_email,

      expected_amount: expectedTotal,
      received_amount: totalPaid,
      platform_tip,

      raw: payment,
    })

    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      event_type: eventType,
      payload: payment,
    })

    /* =========================
       💸 COMMISSION
    ========================= */
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
    const platform_total = commission + platform_tip

    /* =========================
       💰 DONATION
    ========================= */
    await supabase
      .from("donations")
      .upsert(
        {
          campaign_id,
          payment_id: paymentId,
          amount,
          user_email,
        },
        { onConflict: "payment_id" }
      )

    await supabase.rpc("increment_campaign_amount", {
      campaign_id_input: campaign_id,
      amount_input: amount,
    })

    /* =========================
       👤 WALLET OWNER
    ========================= */
    await supabase.rpc("add_balance", {
      user_email_input: campaign.user_email,
      amount_input: netAmount,
    })

    /* =========================
       🏦 PLATFORM
    ========================= */
    await supabase.rpc("add_balance", {
      user_email_input: "platform@impulsasuenos.com",
      amount_input: platform_total,
    })

    /* =========================
       🧾 TRANSACTIONS
    ========================= */
    await supabase.from("transactions").insert([
      {
        user_email,
        type: "purchase",
        amount,
        status: "completed",
        reference_id: campaign_id,
      },
      {
        user_email: campaign.user_email,
        type: "deposit",
        amount: netAmount,
        status: "completed",
        reference_id: paymentId,
      },
      {
        user_email: "platform",
        type: "commission",
        amount: commission,
        status: "completed",
        reference_id: paymentId,
      },
      {
        user_email: "platform",
        type: "tip",
        amount: platform_tip,
        status: "completed",
        reference_id: paymentId,
      },
    ])

    /* =========================
       🎟️ TICKETS
    ========================= */
    const ticketPrice = 1000
    const quantity = Math.floor(amount / ticketPrice)

    const createdTickets: number[] = []

    if (quantity > 0) {
      const { data: lastTicket } = await supabase
        .from("tickets")
        .select("ticket_number")
        .eq("campaign_id", campaign_id)
        .order("ticket_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      let start = lastTicket?.ticket_number || 0

      const tickets = Array.from({ length: quantity }).map((_, i) => ({
        campaign_id,
        payment_id: paymentId,
        ticket_number: start + i + 1,
        user_email,
      }))

      await supabase.from("tickets").insert(tickets)

      createdTickets.push(...tickets.map(t => t.ticket_number))
    }

    /* =========================
       📧 EMAIL
    ========================= */
    if (createdTickets.length > 0) {
      await sendTicketEmail({
        to: user_email,
        tickets: createdTickets,
        campaign: campaign.title,
      })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
