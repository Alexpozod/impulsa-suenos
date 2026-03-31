import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// 🔐 ADMIN DB
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🔐 AUTH CLIENT (VALIDAR TOKEN)
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
      total_tickets,
      image_url
    } = body

    // =========================
    // 🔐 TOKEN
    // =========================
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // =========================
    // 🔐 VALIDAR USUARIO REAL
    // =========================
    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token)

    if (userError || !userData?.user?.email) {
      return NextResponse.json(
        { error: "Usuario no válido" },
        { status: 401 }
      )
    }

    const user_email = userData.user.email.toLowerCase()

    // =========================
    // 🧼 NORMALIZAR
    // =========================
    title = title?.trim()
    description = description?.trim()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    // =========================
    // 🚨 VALIDACIONES
    // =========================
    if (
      !title ||
      !description ||
      !goal_amount ||
      !total_tickets
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    if (goal_amount <= 0 || total_tickets <= 0) {
      return NextResponse.json(
        { error: "Valores inválidos" },
        { status: 400 }
      )
    }

    // =========================
    // 🔒 KYC
    // =========================
    const { data: kyc } = await supabaseAdmin
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json(
        { error: "Debes tener KYC aprobado" },
        { status: 403 }
      )
    }

    // =========================
    // 🚫 DUPLICADOS
    // =========================
    const { data: existing } = await supabaseAdmin
      .from("campaigns")
      .select("id")
      .eq("title", title)
      .eq("user_email", user_email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes una campaña con ese título" },
        { status: 400 }
      )
    }

    // =========================
    // 🎯 CREAR CAMPAÑA
    // =========================
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        title,
        description,
        goal_amount,
        total_tickets,
        user_email,
        image_url: image_url || null,
        status: "active",
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("❌ ERROR INSERT:", error)

      return NextResponse.json(
        { error: "Error creando campaña" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      campaign
    })

  } catch (err) {
    console.error("❌ SERVER ERROR:", err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
