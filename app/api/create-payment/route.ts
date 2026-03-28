import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(client)

export async function POST(req: Request) {
  try {
    const { amount, campaign_id, user_email } = await req.json()

    console.log("🔥 CREATE PAYMENT:", {
      amount,
      campaign_id,
      user_email,
    })

    // 🛡️ VALIDACIÓN
    if (!amount || !campaign_id || !user_email) {
      console.log("❌ Datos incompletos")
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

    const response = await preferenceClient.create({
      body: {
        items: [
          {
            id: "ticket",
            title: "🎟️ Ticket ImpulsaSueños",
            quantity: 1,
            unit_price: Number(amount),
          },
        ],

        // 🔥 CLAVE TOTAL
        metadata: {
          campaign_id: campaign_id,
          user_email: user_email,
        },

        external_reference: String(campaign_id),

        notification_url: `${BASE_URL}/api/webhook`,

        back_urls: {
  success: `${BASE_URL}/payment/success`,
  failure: `${BASE_URL}/payment/failure`,
  pending: `${BASE_URL}/payment/pending`,
},

        auto_return: "approved",
      },
    })

    console.log("✅ PREFERENCE OK")

    return NextResponse.json({
      id: response.id,
      url: response.init_point,
    })

  } catch (error) {
    console.error("❌ ERROR CREATE PAYMENT:", error)

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}
