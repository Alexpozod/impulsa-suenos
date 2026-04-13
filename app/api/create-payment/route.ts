import { NextResponse } from "next/server"
import { z } from "zod"
import { createPayment } from "@/lib/payments/provider"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   VALIDACIÓN
========================= */
const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),
  user_email: z.string().email(),
  provider: z.enum(["mercadopago"]).optional()
})

export async function POST(req: Request) {
  try {

    const body = await req.json()

    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
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

    /* =========================
       🔐 VALIDAR CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, status")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign || campaign.status !== "active") {
      return NextResponse.json(
        { error: "Campaña inválida" },
        { status: 400 }
      )
    }

    /* =========================
       💳 CREAR PAGO
    ========================= */
    const result = await createPayment({
      amount,
      tip,
      campaign_id,
      user_email,
      provider
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