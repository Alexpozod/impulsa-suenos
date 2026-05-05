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
   🔥 SCHEMA PRO (EXTENDIDO)
========================= */
const paymentSchema = z.object({
  amount: z.number().positive().min(100),
  tip: z.number().min(0).optional(),
  campaign_id: z.string().min(1),

  user_email: z.string().email(),
  message: z.string().optional(),
  donor_name: z.string().optional(),
  provider: z.string().optional(),

  ref: z.string().optional(),
  source: z.string().optional()
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
      user_email,
      message = "",
      donor_name,
      ref,
      source
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
       🧠 NORMALIZACIÓN DONADOR
    ========================= */
    let safeDonorName = "Donador"

    if (donor_name && donor_name.trim().length > 0) {
      safeDonorName = donor_name.trim()
    }

    const provider = "mercadopago"

    /* =========================
       🔥 TRACKING REAL
    ========================= */
    const referrer = ref || null
    const finalSource = source || "web"

    /* =========================
       🚀 CREATE PAYMENT
    ========================= */
    const result = await createPayment({
      amount,
      tip,
      campaign_id,
      user_email,
      provider,
      message,
      donor_name: safeDonorName,

      metadata: {
        source: finalSource,
        created_at: new Date().toISOString(),
        ref: referrer,
        referrer: referrer,
        traffic_source: finalSource
      }
    })

    console.log("PAYMENT RESULT:", result)

    /* =========================
       🔔 NOTIFICACIONES (FIX)
    ========================= */

    const ownerEmail = campaign.user_email
    const donorEmail = user_email

    // 🔔 NOTIFICACIÓN PARA EL DUEÑO DE LA CAMPAÑA
    await supabase.from("notifications").insert({
      user_email: ownerEmail,
      type: "donation_received",
      message: `Has recibido una donación de ${safeDonorName}`
    })

    // 🔔 NOTIFICACIÓN PARA EL DONADOR
    await supabase.from("notifications").insert({
      user_email: donorEmail,
      type: "donation_sent",
      message: `Donaste $${amount} correctamente`
    })

    return NextResponse.json(result)

  } catch (error: any) {

    console.error("CREATE PAYMENT ERROR:", error)

    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }
}