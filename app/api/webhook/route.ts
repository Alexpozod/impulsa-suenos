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

    let paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id")

    if (!paymentId) {
      const body = await req.json().catch(() => null)
      paymentId = body?.data?.id
    }

    console.log("📩 WEBHOOK RAW URL:", req.url)
    console.log("📩 PAYMENT ID:", paymentId)

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

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

      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (existing) {
        console.log("⚠️ Pago duplicado")
        return NextResponse.json({ ok: true })
      }

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
