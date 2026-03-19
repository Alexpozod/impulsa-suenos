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

      // 🔒 Evitar duplicados
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (existing) {
        console.log("⚠️ Pago duplicado")
        return NextResponse.json({ ok: true })
      }

      // 💾 Guardar donación
      const { error: donationError } = await supabase
        .from("donations")
        .insert({
          campaign_id,
          amount,
          payment_id: payment.id,
        })

      if (donationError) {
        console.error("❌ Error DB donation:", donationError)
        return NextResponse.json({ ok: true })
      }

      console.log("✅ Donación guardada")

      // 🎟️ GENERACIÓN DE TICKETS

      const ticketPrice = 1000 // puedes cambiarlo después
      const quantity = Math.floor(amount / ticketPrice)

      if (quantity <= 0) {
        console.log("⚠️ No genera tickets")
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
        })
      }

      // guardar tickets
      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(tickets)

      if (ticketError) {
        console.error("❌ Error tickets:", ticketError)
      } else {
        console.log(`🎟️ ${quantity} tickets generados`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("❌ Error webhook:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
