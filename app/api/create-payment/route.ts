import { NextResponse } from "next/server"
import { z } from "zod"
import { createPayment } from "@/lib/payments/provider"

export const runtime = "nodejs"

/* =========================
   VALIDACIÓN
========================= */
const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  tip: z.number().min(0).optional(), // 🔥 CAMBIO
  campaign_id: z.string().min(1),
  user_email: z.string().email(),
  provider: z.enum(["mercadopago", "stripe", "paypal", "crypto"]).optional()
})

export async function POST(req: Request) {
  try {

    const rawBody = await req.json()

    const parsed = paymentSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      amount,
      tip = 0,
      campaign_id,
      user_email,
      provider = "mercadopago"
    } = parsed.data

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")

    const result = await createPayment({
      amount,
      campaign_id,
      user_email,
      provider,
      baseUrl,
      metadata: {
        campaign_id,
        user_email,
        tip // 🔥 IMPORTANTE
      }
    })

    if (!result || typeof result !== "object") {
      return NextResponse.json(
        { error: "Invalid payment response" },
        { status: 500 }
      )
    }

    return NextResponse.json(result)

  } catch (error: any) {

    console.error("🔥 CREATE PAYMENT ERROR:", error)

    return NextResponse.json(
      {
        error: "Error creando pago",
        message: error?.message || "unknown"
      },
      { status: 500 }
    )
  }
}