import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(client)

export async function POST(req: Request) {
  try {
    const { amount, campaign_id } = await req.json()

    console.log("🔥 CREATE PAYMENT:", { amount, campaign_id })

    const response = await preferenceClient.create({
      body: {
        items: [
  {
    id: "donation",
    title: "Donación",
    quantity: 1,
    unit_price: Number(amount),
  },
],


        // ✅ GUARDA EL ID DE LA CAMPAÑA
        metadata: {
          campaign_id: String(campaign_id),
        },

        // ✅ BACKUP (MUY IMPORTANTE)
        external_reference: String(campaign_id),

        // 🚨 AQUÍ ESTABA EL ERROR
        notification_url: "https://resumptive-leon-evolvable.ngrok-free.dev/api/webhook",

        // ✅ REDIRECCIÓN DESPUÉS DEL PAGO
        back_urls: {
  success: "https://resumptive-leon-evolvable.ngrok-free.dev/",
  failure: "https://resumptive-leon-evolvable.ngrok-free.dev/",
  pending: "https://resumptive-leon-evolvable.ngrok-free.dev/",
},

        auto_return: "approved",
      },
    })

    console.log("✅ PREFERENCE:", response)

    return NextResponse.json({
      id: response.id,
      url: response.init_point,
    })

  } catch (error) {
    console.error("❌ ERROR CREATE PAYMENT:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
