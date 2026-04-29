import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logToDB } from "@/lib/logToDB"
import { sendNotification } from "@/lib/notifications/sendNotification"

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    let {
      title,
      description,
      goal_amount,
      image_url,
      images,
      category
    } = body

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token)

    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 })
    }

    const user_email = userData.user.email.toLowerCase()

    // NORMALIZACIÓN
    title = title?.trim()
    description = description?.trim()
    goal_amount = Number(goal_amount)
    category = category || "general"

    if (!title || !description || !goal_amount) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
    }

    // 🔒 KYC (NO BLOQUEA CREACIÓN - SOLO CONTROL)
const { data: kyc } = await supabaseAdmin
  .from("kyc")
  .select("status")
  .eq("user_email", user_email)
  .maybeSingle()

// 🔥 PERMITIMOS CREAR CAMPAÑA SIN KYC
if (!kyc || kyc.status !== "approved") {

  await logToDB("warning", "campaign_created_without_kyc", {
    user_email,
    kyc_status: kyc?.status || "none"
  })

  console.warn("⚠️ Usuario creó campaña sin KYC:", user_email)
}

    // 🧠 NORMALIZAR IMÁGENES
    const safeImages = Array.isArray(images) ? images : []

    // ✅ INSERT CORRECTO (CON IMÁGENES)
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        title,
        description,
        goal_amount,
        user_email,
        image_url: image_url || safeImages[0] || null,
        images: safeImages,
        category,
        status: "active",
        type: "crowdfunding", // 🔥 elimina raffle
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("DB ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logToDB("info", "campaign_created", {
      campaign_id: campaign.id,
      user_email,
      category,
      images_count: safeImages.length
    })

/* =========================
   📧 NOTIFICACIÓN CREACIÓN CAMPAÑA
========================= */
await sendNotification({
  user_email,
  type: "campaign_created",
  title: "Campaña creada con éxito",
  message: "Tu campaña ya está activa",
  metadata: {
    campaign_title: campaign.title,
    goal_amount: campaign.goal_amount
  },
  sendEmail: true
})

    return NextResponse.json({ ok: true, campaign })

  } catch (err: any) {
    console.error("SERVER ERROR:", err)

    return NextResponse.json(
      { error: err.message || "Error servidor" },
      { status: 500 }
    )
  }
}