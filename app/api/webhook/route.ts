import { NextResponse } from "next/server"
import crypto from "crypto"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { sendTicketEmail } from "@/lib/email"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📊 AUDIT LOGGER (STRIPE STYLE)
========================= */
async function logEvent(
  paymentId: string,
  event_type: string,
  status: string,
  payload?: any
) {
  try {
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      event_type,
      status,
      payload: payload || null,
    })
  } catch (e) {
    console.warn("audit log failed", e)
  }
}

/* =========================
   🔐 VERIFY SIGNATURE MP (FIXED)
========================= */
function verifySignature(req: Request) {
  const signature = req.headers.get("x-signature")
  const requestId = req.headers.get("x-request-id")

  if (!signature || !requestId) return false

  const secret = process.env.MP_WEBHOOK_SECRET!
  const parts = signature.split(",")

  let ts = ""
  let v1 = ""

  for (const part of parts) {
    const [k, v] = part.split("=")
    if (k === "ts") ts = v
    if (k === "v1") v1 = v
  }

  const url = new URL(req.url)
  const dataId = url.searchParams.get("data.id")

  if (!ts || !v1 || !dataId) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`

  const hash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  return hash === v1
}

/* =========================
   🚀 WEBHOOK
========================= */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔐 SIGNATURE FIRST
    ========================= */
    if (!verifySignature(req)) {
      console.warn("❌ Invalid MP signature")
      await logEvent(paymentId, "webhook_signature", "invalid")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🚫 IDEMPOTENCY CHECK
    ========================= */
    const { data: existing } = await supabase
      .from("processed_payments")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existing) {
      await logEvent(paymentId, "webhook_duplicate", "ignored")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔒 LOCK
    ========================= */
    const lockKey = crypto.createHash("md5").update(paymentId).digest("hex")

    await supabase.rpc("advisory_lock", {
      lock_key: lockKey,
    })

    /* =========================
       💳 GET PAYMENT
    ========================= */
    const payment = await paymentClient.get({ id: paymentId })

    await logEvent(paymentId, "payment_fetched", "ok")

    if (!payment || payment.status !== "approved") {
      await logEvent(paymentId, "payment_status", "not_approved")
      return NextResponse.json({ ok: true })
    }

    await logEvent(paymentId, "payment_approved", "ok")

    /* =========================
       📦 METADATA
    ========================= */
    const campaign_id = payment.metadata?.campaign_id

    const user_email =
      payment.metadata?.user_email ||
      payment.payer?.email ||
      `guest_${payment.id}@impulsasuenos.com`

    const amount = Number(payment.metadata?.amount || 0)
    const platform_tip = Number(payment.metadata?.platform_tip || 0)

    const totalPaid = Number(payment.transaction_amount || 0)
    const expectedTotal = amount + platform_tip

    if (!campaign_id) {
      await logEvent(paymentId, "missing_campaign", "ignored")
      return NextResponse.json({ ok: true })
    }

    if (Math.abs(totalPaid - expectedTotal) > 1) {
      await logEvent(paymentId, "amount_mismatch", "error", {
        expectedTotal,
        totalPaid,
      })
      return NextResponse.json({ ok: true })
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
      await logEvent(paymentId, "self_payment", "ignored")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 IDEMPOTENCY INSERT
    ========================= */
    const { error: insertError } = await supabase
      .from("processed_payments")
      .insert({ payment_id: paymentId })

    if (insertError && insertError.code !== "23505") {
      throw insertError
    }

    await logEvent(paymentId, "idempotency_registered", "ok")

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
    await supabase.from("donations").upsert(
      {
        campaign_id,
        payment_id: paymentId,
        amount,
        user_email,
      },
      { onConflict: "payment_id" }
    )

    await logEvent(paymentId, "donation_created", "ok")

    await supabase.rpc("increment_campaign_amount", {
      campaign_id_input: campaign_id,
      amount_input: amount,
    })

    await supabase.rpc("add_balance", {
      user_email_input: campaign.user_email,
      amount_input: netAmount,
    })

    await supabase.rpc("add_balance", {
      user_email_input: "platform@impulsasuenos.com",
      amount_input: platform_total,
    })

    await logEvent(paymentId, "wallet_updated", "ok")

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

      await logEvent(paymentId, "ticket_generated", "ok", {
        quantity: createdTickets.length,
      })
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

    await logEvent(paymentId, "webhook_completed", "success")

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error)

    await logEvent("unknown", "webhook_error", "error", {
      message: String(error),
    })

    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
