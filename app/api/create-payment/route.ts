import { NextResponse } from "next/server"
import { z } from "zod"

import { createPayment } from "@/lib/payments/provider"

import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

export const runtime = "nodejs"

/* =========================
   ✅ VALIDACIÓN
========================= */
const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  platform_tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),
  user_email: z.string().email(),
  provider: z.enum(["mercadopago", "stripe", "paypal", "crypto"]).optional()
})

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()

    logInfo("Create payment request", rawBody)

    const parsed = paymentSchema.safeParse(rawBody)

    if (!parsed.success) {
      await logErrorToDB("invalid_payment_input", parsed.error)

      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      amount,
      platform_tip = 0,
      campaign_id,
      user_email,
      provider = "mercadopago"
    } = parsed.data

    const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (req.headers.get("origin") as string)

if (!baseUrl) {
  throw new Error("BASE URL missing")
}

    const total = Number(amount) + Number(platform_tip)

    await logToDB("info", "payment_intent_created", {
      campaign_id,
      user_email,
      total,
      provider
    })

    /* =========================
       💳 CREATE PAYMENT (PROVIDER)
    ========================= */
    const result = await createPayment({
      amount,
      platform_tip,
      campaign_id,
      user_email,
      provider,
      baseUrl
    })

    logInfo("Payment provider response", {
      campaign_id,
      provider
    })

    return NextResponse.json(result)

  } catch (error) {
    logError("CREATE PAYMENT ERROR", error)
    await logErrorToDB("create_payment_error", error)

    await sendAlert({
      title: "Error creando pago",
      message: "Falló create payment",
      data: { error }
    })

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}