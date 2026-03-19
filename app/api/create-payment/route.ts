import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(client)

const BASE_URL = "https://impulsa-suenos.vercel.app"

export async function POST(req: Request) {
  try {
    const { amount, campaign_id } = await req.json()

    console.log("🔥 CREATE PAYMENT:", { amount, campaign_id })

    const response = await preferenceClient.create({
      body: {
        items: [
          {
            id: "donation",
            title: "🎟️ Ticket ImpulsaSueños",
            quantity: 1,
            unit_price: Number(amount),
          },
        ],

        metadata: {
          campaign_id: String(campaign_id),
        },

        external_reference: String(campaign_id),

        notification_url: `${BASE_URL}/api/webhook`,

        back_urls: {
          success: BASE_URL,
          failure: BASE_URL,
          pending: BASE_URL,
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
