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
   🔐 VERIFY SIGNATURE MP
========================= */
function verifySignature(req: Request, body: any) {
  const signature = req.headers.get("x-signature")
  const requestId = req.headers.get("x-request-id")

  if (!signature || !requestId) return false

  const secret = process.env.MP_WEBHOOK_SECRET!

  const payload = JSON.stringify(body)
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(requestId + payload)
    .digest("hex")

  return signature === hmac
}

/* =========================
   🚀 WEBHOOK
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
       🔒 ANTI-REPLAY CHECK
    ========================= */
    const { data: alreadyProcessed } = await supabase
      .from("processed_payments")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (alreadyProcessed) {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💳 GET PAYMENT MP
    ========================= */
    const payment = await paymentClient.get({ id: paymentId }).catch(() => null)

    if (!payment || payment.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔐 VERIFY SIGNATURE
    ========================= */
    if (!verifySignature(req, body)) {
      console.warn("❌ Invalid MP signature")
      return NextResponse.json({ ok: true })
    }

    /* =========================
       🧱 POSTGRES LOCK (ATOMIC)
    ========================= */
    const lockKey = crypto.createHash("md5").update(paymentId).digest("hex")

    await supabase.rpc("advisory_lock", {
      lock_key: lockKey
    })

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

    if (!campaign_id) return NextResponse.json({ ok: true })

    /* =========================
       🧮 VALIDACIÓN DE MONTO
    ========================= */
    const expectedTotal = amount + platform_tip

    if (Math.abs(totalPaid - expectedTotal) > 1) {
      console.warn("❌ Amount mismatch")
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
      return NextResponse.json({ ok: true })
    }

    /* =========================
       💰 ID EMPOTENCY INSERT
    ========================= */
    const { error: insertError } = await supabase
      .from("processed_payments")
      .insert({
        payment_id: paymentId
      })

    if (insertError && insertError.code !== "23505") {
      throw insertError
    }

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
       💰 DONATION (UPSERT SAFE)
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
      amount_input: amount
    })

    /* =========================
       👤 WALLET OWNER
    ========================= */
    await supabase.rpc("add_balance", {
      user_email_input: campaign.user_email,
      amount_input: netAmount
    })

    /* =========================
       🏦 PLATFORM WALLET
    ========================= */
    await supabase.rpc("add_balance", {
      user_email_input: "platform@impulsasuenos.com",
      amount_input: platform_total
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
        reference_id: campaign_id
      },
      {
        user_email: campaign.user_email,
        type: "deposit",
        amount: netAmount,
        status: "completed",
        reference_id: paymentId
      },
      {
        user_email: "platform",
        type: "commission",
        amount: commission,
        status: "completed",
        reference_id: paymentId
      },
      {
        user_email: "platform",
        type: "tip",
        amount: platform_tip,
        status: "completed",
        reference_id: paymentId
      }
    ])

    /* =========================
       🎟️ TICKETS SAFE GENERATION
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

      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(tickets)

      if (ticketError) {
        console.error("Ticket error:", ticketError)
      }

      createdTickets.push(...tickets.map(t => t.ticket_number))
    }

    /* =========================
       📧 EMAIL
    ========================= */
    if (createdTickets.length > 0) {
      await sendTicketEmail({
        to: user_email,
        tickets: createdTickets,
        campaign: campaign.title
      })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
