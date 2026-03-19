import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const paymentClient = new Payment(client)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

// 🔥 soporta TODOS los formatos de MercadoPago
let paymentId =
  url.searchParams.get("data.id") ||
  url.searchParams.get("id")

// 🔥 fallback (cuando viene en body)
if (!paymentId) {
  const body = await req.json().catch(() => null)
  paymentId = body?.data?.id
}

console.log("📩 WEBHOOK RAW URL:", req.url)
console.log("📩 WEBHOOK BODY:", paymentId)

    console.log("📩 WEBHOOK RAW:", req.url)
    console.log("💳 PAYMENT ID:", paymentId)

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    // ✅ SDK V2 CORRECTO
    const payment = await paymentClient.get({ id: paymentId })

    console.log("💳 PAYMENT:", payment)

    if (payment.status === "approved") {
      const campaign_id =
        payment.metadata?.campaign_id ||
        payment.external_reference

      const amount = payment.transaction_amount

      if (!campaign_id) {
        console.log("⚠️ No campaign_id")
        return NextResponse.json({ ok: true })
      }

      // evitar duplicados
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (existing) {
        console.log("⚠️ Pago duplicado")
        return NextResponse.json({ ok: true })
      }

      // guardar donación
      const { error } = await supabase.from("donations").insert({
        campaign_id,
        amount,
        payment_id: payment.id,
      })

      if (error) {
        console.error("❌ Error DB:", error)
      } else {
        console.log("✅ Donación guardada")
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("❌ Error webhook:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
