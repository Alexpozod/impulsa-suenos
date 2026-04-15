import { NextResponse } from "next/server"
import { z } from "zod"
import { createPayment } from "@/lib/payments/provider"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),
  user_email: z.string().email(),
  message: z.string().optional(),
  provider: z.string().optional() // 🔥 CAMBIO CLAVE (NO ENUM)
})

export async function POST(req: Request) {
  try {

    const body = await req.json()

    console.log("BODY:", body) // 🔍 DEBUG REAL

    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      console.error("VALIDATION ERROR:", parsed.error)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const {
      amount,
      tip = 0,
      campaign_id,
      user_email,
      message = ""
    } = parsed.data

    // 🔥 FORZAMOS PROVIDER SIEMPRE
    const provider = "mercadopago"

    const result = await createPayment({
      amount,
      tip,
      campaign_id,
      user_email,
      provider,
      message
    })

    console.log("PAYMENT RESULT:", result)

    return NextResponse.json(result)

  } catch (error: any) {

    console.error("CREATE PAYMENT ERROR:", error)

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}