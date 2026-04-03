import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { z } from "zod"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"

export const runtime = "nodejs"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const preferenceClient = new Preference(client)

const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  platform_tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),
  user_email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()

    logInfo("Create payment request", rawBody)

    const parsed = paymentSchema.safeParse(rawBody)

    if (!parsed.success) {
      await logErrorToDB("invalid_payment_input", parsed.error)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { amount, platform_tip = 0, campaign_id, user_email } = parsed.data

    const total = Number(amount) + Number(platform_tip)

    await logToDB("info", "payment_intent_created", {
      campaign_id,
      user_email,
      total
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: "donation",
            title: "Donación",
            quantity: 1,
            unit_price: total,
          },
        ],
        metadata: {
          campaign_id,
          user_email,
          amount,
          platform_tip,
        },
        notification_url: `${baseUrl}/api/webhook`,
      },
    })

    logInfo("Preference creada", {
      id: preference.id,
      campaign_id
    })

    return NextResponse.json({
      id: preference.id,
      url: preference.init_point,
    })

  } catch (error) {
    logError("create payment error", error)
    await logErrorToDB("create_payment_error", error)

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}