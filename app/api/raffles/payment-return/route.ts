import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function redirect(req: Request, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303)
}

async function processPaymentReturn(req: Request, token: string | null) {
  if (!token || token.length > 512) {
    return redirect(req, "/raffles/payment/check")
  }

  const { data: payment, error } = await supabase.schema("raffles")
    .from("payments")
    .select("id,status,orders(id,status)")
    .eq("provider", "flow")
    .eq("provider_payment_id", token)
    .maybeSingle()

  if (error || !payment) {
    return redirect(req, "/raffles/payment/check")
  }

  const order = Array.isArray(payment.orders) ? payment.orders[0] : payment.orders
  if (!order?.id) return redirect(req, "/raffles/payment/check")

  if (payment.status === "approved" && order.status === "paid") {
    return redirect(req, `/raffles/payment/success?order=${encodeURIComponent(order.id)}`)
  }

  if (["failed","refunded"].includes(payment.status) ||
      order.status === "cancelled") {
    return redirect(req, `/raffles/payment/failure?order=${encodeURIComponent(order.id)}`)
  }

  return redirect(req, `/raffles/payment/check?order=${encodeURIComponent(order.id)}`)
}

export async function GET(req: Request) {
  try {
    return await processPaymentReturn(req, new URL(req.url).searchParams.get("token"))
  } catch {
    console.error("raffles_payment_return_get_failed")
    return redirect(req, "/raffles/payment/check")
  }
}

export async function POST(req: Request) {
  try {
    const type = req.headers.get("content-type") || ""
    let token: string | null = null
    if (type.includes("application/x-www-form-urlencoded") ||
        type.includes("multipart/form-data")) {
      const form = await req.formData()
      const candidate = form.get("token")
      token = typeof candidate === "string" ? candidate : null
    } else {
      token = new URLSearchParams(await req.text()).get("token")
    }
    return await processPaymentReturn(req, token)
  } catch {
    console.error("raffles_payment_return_post_failed")
    return redirect(req, "/raffles/payment/check")
  }
}
