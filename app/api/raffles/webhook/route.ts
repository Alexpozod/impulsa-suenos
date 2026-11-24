import { NextResponse } from "next/server"
import axios from "axios"
import CryptoJS from "crypto-js"
import { createClient } from "@supabase/supabase-js"
import { processPayment } from "@/lib/raffles/payment"
import { releaseOrderReservations } from "@/lib/raffles/tickets/releaseOrderReservations"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FLOW_APPROVED = 2
const FLOW_PENDING = 1
const FLOW_REJECTED = 3

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const rawToken = form.get("token")
    const token = typeof rawToken === "string" ? rawToken.trim() : ""

    if (!token || token.length > 512) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 })
    }

    if (!process.env.FLOW_API_KEY || !process.env.FLOW_SECRET_KEY ||
        !process.env.FLOW_BASE_URL) {
      console.error("raffles_flow_webhook_configuration_missing")
      return NextResponse.json({ error: "server_error" }, { status: 503 })
    }

    // Flow's notification is not proof of payment. Validate with getStatus.
    const params = { apiKey: process.env.FLOW_API_KEY, token }
    const toSign = Object.keys(params).sort()
      .map(k => `${k}${params[k as keyof typeof params]}`).join("")
    const s = CryptoJS.HmacSHA256(toSign, process.env.FLOW_SECRET_KEY).toString()

    const response = await axios.get(
      `${process.env.FLOW_BASE_URL}/payment/getStatus`,
      { params: { ...params, s }, timeout: 15000 }
    )
    const flow = response.data
    const status = Number(flow?.status)

    if (![FLOW_PENDING, FLOW_APPROVED, FLOW_REJECTED].includes(status)) {
      console.error("raffles_flow_status_unrecognized")
      return NextResponse.json({ error: "provider_status_invalid" }, { status: 503 })
    }

    const { data: dbPayment, error: paymentError } = await supabase
      .schema("raffles").from("payments")
      .select("id,order_id,amount_clp,status,processed_at,orders(id,raffle_id,status)")
      .eq("provider", "flow")
      .eq("provider_payment_id", token)
      .maybeSingle()

    if (paymentError) throw paymentError
    if (!dbPayment?.order_id) {
      // Flow can notify before the checkout has committed its payment row.
      console.error("raffles_flow_webhook_payment_not_found")
      return NextResponse.json({ error: "payment_not_found" }, { status: 503 })
    }

    const order = Array.isArray(dbPayment.orders) ? dbPayment.orders[0] : dbPayment.orders
    if (!order?.id) {
      return NextResponse.json({ error: "order_not_found" }, { status: 503 })
    }

    // Cross-check Flow against our immutable local order and payment amount.
    if (String(flow.commerceOrder ?? "") !== String(order.id) ||
        flow.currency !== "CLP" ||
        !Number.isFinite(Number(flow.amount)) ||
        Math.abs(Number(flow.amount) - Number(dbPayment.amount_clp)) > 0.01) {
      console.error("raffles_flow_webhook_payment_mismatch")
      return NextResponse.json({ error: "provider_payment_mismatch" }, { status: 503 })
    }

    // Preserve a single audit record per Flow token; mark completed only
    // AFTER all durable processing succeeds, not before ticket assignment.
    const { error: eventError } = await supabase.schema("raffles")
      .from("webhook_events")
      .upsert({
        provider: "flow",
        event_id: token,
        event_type: "payment",
        payload: flow,
        processed: false
      }, { onConflict: "event_id" })
    if (eventError) throw eventError

    if (status === FLOW_PENDING) {
      return NextResponse.json({ ok: true, status: "pending" })
    }

    if (status === FLOW_REJECTED) {
      // Never downgrade an already approved or fulfilled payment.
      if (dbPayment.status === "pending" && order.status === "pending") {
        const { error: failedError } = await supabase.schema("raffles")
          .from("payments").update({ status: "failed" })
          .eq("id", dbPayment.id).eq("status", "pending")
        if (failedError) throw failedError

        const { error: cancelledError } = await supabase.schema("raffles")
          .from("orders").update({ status: "cancelled" })
          .eq("id", order.id).eq("status", "pending")
        if (cancelledError) throw cancelledError
      }
      // A previous rejection attempt may have updated the payment/order
      // before reservation release failed. Reconcile that state on retry.
      if (order.status !== "paid" &&
          (dbPayment.status === "failed" ||
           (dbPayment.status === "pending" && order.status === "pending"))) {
        await releaseOrderReservations(order.id)
      }
    } else {
      const result = await processPayment({
        provider: "flow",
        providerToken: token,
        paymentId: token,
        providerFee: Number(flow.fee || 0)
      })

      // Another worker may be finalizing this payment. Ask Flow to retry.
      if (result.message === "already_processing" || result.message === "terminal_payment_state") {
        return NextResponse.json({ error: "retry_processing" }, { status: 503 })
      }
      if (!result.success) {
        return NextResponse.json({ error: "processing_failed" }, { status: 503 })
      }
    }

    const { error: markError } = await supabase.schema("raffles")
      .from("webhook_events").update({ processed: true })
      .eq("event_id", token).eq("provider", "flow")
    if (markError) throw markError

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error("raffles_flow_webhook_processing_failed",
      axios.isAxiosError(error) ? error.response?.status ?? "provider_error" : "pipeline_error")
    return NextResponse.json({ error: "server_error" }, { status: 503 })
  }
}
