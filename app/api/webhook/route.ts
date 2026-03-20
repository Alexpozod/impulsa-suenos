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

    let payment

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (error) {
      console.log("⚠️ Payment no encontrado (normal en webhooks múltiples)")
      return NextResponse.json({ ok: true })
    }

    console.log("💳 PAYMENT STATUS:", payment.status)

    if (payment.status === "approved") {

      // 🔥 OBTENER DATOS IMPORTANTES
      const campaign_id =
        payment.metadata?.campaign_id ||
        payment.external_reference ||
        null

      const user_email =
        payment.metadata?.user_email ||
        payment.payer?.email ||
        "no-email"

      const amount = Number(payment.transaction_amount || 0)

      console.log("📦 METADATA:", payment.metadata)
      console.log("📧 EMAIL DETECTADO:", user_email)
      console.log("🎯 CAMPAIGN:", campaign_id)

      if (!campaign_id) {
        console.log("⚠️ No campaign_id")
        return NextResponse.json({ ok: true })
      }

      // 🔒 EVITAR PAGOS DUPLICADOS
      const { data: existing } = await supabase
        .from("donations")
        .select("id")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (existing) {
        console.log("⚠️ Pago ya procesado")
        return NextResponse.json({ ok: true })
      }

      // 💰 GUARDAR DONACIÓN
      const { error: donationError } = await supabase
        .from("donations")
        .insert({
          campaign_id,
          amount,
          payment_id: payment.id,
        })

      if (donationError) {
        console.error("❌ Error guardando donación:", donationError)
      }

      // 🎟️ GENERAR TICKETS
      const ticketPrice = 1000
      const quantity = Math.floor(amount / ticketPrice)

      if (quantity <= 0) {
        console.log("⚠️ No genera tickets")
        return NextResponse.json({ ok: true })
      }

      // 🔢 OBTENER ÚLTIMO TICKET DE LA CAMPAÑA
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
          campaign_id, // 🔥 ASOCIADO A CAMPAÑA
          payment_id: payment.id,
          ticket_number: startNumber + i,
          user_email,
        })
      }

      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(tickets)

      if (ticketError) {
        console.error("❌ Error guardando tickets:", ticketError)
      } else {
        console.log(`🎟️ ${quantity} tickets generados correctamente`)
      }
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR WEBHOOK:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
