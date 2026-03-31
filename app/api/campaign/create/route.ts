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
      image_url
    } = body

    // 🔥 USER REAL DESDE MIDDLEWARE
    const user_email = req.headers.get("x-user-email")

    if (!user_email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // 🧼 NORMALIZAR
    title = title?.trim()
    description = description?.trim()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    // 🚨 VALIDACIÓN
    if (!title || !description || !goal_amount || !total_tickets) {
      return NextResponse.json(
        { error: "Faltan campos" },
        { status: 400 }
      )
    }

    if (goal_amount <= 0 || total_tickets <= 0) {
      return NextResponse.json(
        { error: "Valores inválidos" },
        { status: 400 }
      )
    }

    // 🔒 KYC
    const { data: kyc } = await supabase
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

    // 🚫 DUPLICADO
    const { data: existing } = await supabase
      .from("campaigns")
      .select("id")
      .eq("title", title)
      .eq("user_email", user_email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Campaña duplicada" },
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
      console.error(error)
      return NextResponse.json(
        { error: "Error creando campaña" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, campaign })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
