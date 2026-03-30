import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export const runtime = "nodejs" // 🔥 CRÍTICO

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN missing")
}

const client = new MercadoPagoConfig({
  accessToken,
})

const preferenceClient = new Preference(client)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { amount, platform_tip = 0, campaign_id, user_email } = body

    if (!amount || !campaign_id || !user_email) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL missing")
    }

    const total = Number(amount) + Number(platform_tip)

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: "donation",
            title: "🎟️ Donación / Campaña",
            quantity: 1,
            unit_price: total,
          },
        ],

        metadata: {
          campaign_id,
          user_email,
          amount: Number(amount),
          platform_tip: Number(platform_tip),
        },

        external_reference: campaign_id,

        notification_url: `${baseUrl}/api/webhook`,

        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`,
        },

        auto_return: "approved",
      },
    })

    return NextResponse.json({
      id: preference.id,
      url: preference.init_point,
    })

  } catch (error) {
    console.error("❌ CREATE PAYMENT ERROR:", error)

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}
