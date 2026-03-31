import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    let {
      title,
      description,
      goal_amount,
      total_tickets,
      image_url,
      user_email
    } = body

    console.log("📩 CREATE CAMPAIGN:", body)

    // 🧼 NORMALIZAR
    title = title?.trim()
    description = description?.trim()
    user_email = user_email?.trim().toLowerCase()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    // 🚨 VALIDACIÓN
    if (
      !title ||
      !description ||
      !goal_amount ||
      !total_tickets ||
      !user_email
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

    // 🔐 VALIDAR USUARIO REAL
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", user_email)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json(
        { error: "Usuario no válido" },
        { status: 401 }
      )
    }

    // 🔒 VALIDAR KYC
    const { data: kyc } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json(
        { error: "Debes tener KYC aprobado para crear campañas" },
        { status: 403 }
      )
    }

    // 🚫 EVITAR DUPLICADOS
    const { data: existing } = await supabase
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

    // 🎯 CREAR
    const { data: campaign, error } = await supabase
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

    console.log("✅ CAMPAIGN CREATED:", campaign)

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
