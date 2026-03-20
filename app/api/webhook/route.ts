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

    console.log("📩 PAYMENT ID:", paymentId)

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    const payment = await paymentClient.get({ id: paymentId })

    console.log("💳 PAYMENT:", payment)

    if (payment.status === "approved") {
      console.log("📦 METADATA:", payment.metadata)

      const campaign_id =
        payment.metadata?.campaign_id ||
        payment.external_reference

      const user_email =
  payment.metadata?.user_email || null

      const amount = Number(payment.transaction_amount || 0)

      if (!campaign_id) {
        return NextResponse.json({ ok: true })
      }

      // evitar duplicados
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ ok: true })
      }

      // guardar donación
      await supabase.from("donations").insert({
        campaign_id,
        amount,
        payment_id: payment.id,
      })

      // generar tickets
      const ticketPrice = 1000
      const quantity = Math.floor(amount / ticketPrice)

      if (quantity <= 0) {
        return NextResponse.json({ ok: true })
      }

      // obtener último ticket
      const { data: lastTicket } = await supabase
        .from("tickets")
        .select("ticket_number")
        .eq("campaign_id", campaign_id)
        .order("ticket_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      let startNumber = lastTicket?.ticket_number || 0

      const tickets = []

      for (let i = 1; i <= quantity; i++) {
        tickets.push({
          campaign_id,
          payment_id: payment.id,
          ticket_number: startNumber + i,
          user_email,
        })
      }

      await supabase.from("tickets").insert(tickets)

      console.log(`🎟️ ${quantity} tickets generados`)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR WEBHOOK:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
