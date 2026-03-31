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
   📊 AUDIT LOGGER
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
   🔐 VERIFY SIGNATURE
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
   🔥 LEDGER INSERT (FASE 1)
========================= */
async function insertLedger({
  user_id,
  campaign_id,
  amount,
  paymentId,
  type = "payment",
  metadata = {},
}: any) {
  try {
    await supabase.from("financial_ledger").insert({
      user_id,
      campaign_id,
      type,
      amount,
      currency: "USD",
      status: "confirmed",
      provider: "mercadopago",
      external_reference: paymentId,
      payment_id: paymentId,
      metadata,
    })
  } catch (e) {
    console.warn("ledger insert failed", e)
  }
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

    if (!paymentId) return NextResponse.json({ ok: true })

    if (!verifySignature(req)) {
      await logEvent(paymentId, "signature_invalid", "error")
      return NextResponse.json({ ok: true })
    }

    const { data: existing } = await supabase
      .from("processed_payments")
      .select("payment_id")
      .eq("payment_id", paymentId)
      .maybeSingle()

    if (existing) {
      await logEvent(paymentId, "duplicate_webhook", "ignored")
      return NextResponse.json({ ok: true })
    }

    const lockKey = crypto.createHash("md5").update(paymentId).digest("hex")

    await supabase.rpc("advisory_lock", {
      lock_key: lockKey,
    })

    const payment = await paymentClient.get({ id: paymentId })

    if (!payment || payment.status !== "approved") {
      await logEvent(paymentId, "payment_not_approved", "ignored")
      return NextResponse.json({ ok: true })
    }

    await logEvent(paymentId, "payment_approved", "ok")

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
      await logEvent(paymentId, "missing_campaign", "error")
      return NextResponse.json({ ok: true })
    }

    if (Math.abs(totalPaid - expectedTotal) > 1) {
      await logEvent(paymentId, "amount_mismatch", "error", {
        expectedTotal,
        totalPaid,
      })
      return NextResponse.json({ ok: true })
    }

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email, title, user_id")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) return NextResponse.json({ ok: true })

    if (campaign.user_email === user_email) {
      await logEvent(paymentId, "self_payment", "blocked")
      return NextResponse.json({ ok: true })
    }

    const { error: insertError } = await supabase
      .from("processed_payments")
      .insert({ payment_id: paymentId })

    if (insertError && insertError.code !== "23505") {
      throw insertError
    }

    await supabase.rpc("process_payment_full", {
      p_payment_id: paymentId,
      p_campaign_id: campaign_id,
      p_user_email: user_email,
      p_amount: amount,
      p_platform_tip: platform_tip,
    })

    await logEvent(paymentId, "rpc_processed", "success")

    await insertLedger({
      user_id: campaign.user_id,
      campaign_id,
      amount: totalPaid,
      paymentId,
      type: "payment",
      metadata: {
        campaign_id,
        user_email,
        expectedTotal,
        totalPaid,
      },
    })

    const { data: tickets } = await supabase
      .from("tickets")
      .select("ticket_number")
      .eq("payment_id", paymentId)

    if (tickets && tickets.length > 0) {
      await sendTicketEmail({
        to: user_email,
        tickets: tickets.map(t => t.ticket_number),
        campaign: campaign.title,
      })
    }

    await logEvent(paymentId, "email_sent", "ok")
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
