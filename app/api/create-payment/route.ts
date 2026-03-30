import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(client)

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 🔐 Obtener usuario real desde sesión
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { amount, platform_tip = 0, campaign_id } = await req.json()

    if (!amount || !campaign_id) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

    const total = Number(amount) + Number(platform_tip)

    const response = await preferenceClient.create({
      body: {
        items: [
          {
            id: "donation",
            title: "🎟️ Compra / Donación ImpulsaSueños",
            quantity: 1,
            unit_price: total,
          },
        ],

        metadata: {
          campaign_id,
          user_email: user.email, // 🔥 AHORA SEGURO
          amount,
          platform_tip,
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
