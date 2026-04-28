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
   🔥 SCHEMA PRO (CLARO)
========================= */
const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),

  // 👇 ESTE ES EL CREADOR (NO DONADOR)
  user_email: z.string().email(),

  message: z.string().optional(),

  // 👇 ESTE ES EL DONADOR REAL
  donor_name: z.string().optional(),

  provider: z.string().optional()
})

export async function POST(req: Request) {
  try {

    const body = await req.json()
    console.log("BODY:", body)

    const parsed = paymentSchema.safeParse(body)

    if (!parsed.success) {
      console.error("VALIDATION ERROR:", parsed.error)
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    const {
      amount,
      tip = 0,
      campaign_id,
      user_email, // 👈 CREADOR
      message = "",
      donor_name
    } = parsed.data

    /* =========================
       🔒 VALIDAR CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, status, user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json(
        { error: "campaign_not_found" },
        { status: 404 }
      )
    }

    if (campaign.status === "frozen") {
      return NextResponse.json(
        { error: "campaign_frozen" },
        { status: 403 }
      )
    }

    /* =========================
       🔐 VALIDACIÓN EXTRA (PRO)
       evita fraude manual
    ========================= */
    if (campaign.user_email !== user_email) {
      return NextResponse.json(
        { error: "invalid_campaign_owner" },
        { status: 403 }
      )
    }

    /* =========================
       🧠 NORMALIZACIÓN DONADOR
    ========================= */
    let safeDonorName = "Donador"

    if (donor_name && donor_name.trim().length > 0) {
      safeDonorName = donor_name.trim()
    }

    /* =========================
       🔥 PROVIDER FIJO
    ========================= */
    const provider = "mercadopago"

    /* =========================
       🚀 CREATE PAYMENT PRO
    ========================= */
    const result = await createPayment({
      amount,
      tip,
      campaign_id,
      user_email, // 👈 CREADOR (correcto)
      provider,
      message,
      donor_name: safeDonorName,

      // 🔥 PREPARADO PARA ESCALAR (NO ROMPE)
      metadata: {
        source: "web",
        created_at: new Date().toISOString()
      }
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