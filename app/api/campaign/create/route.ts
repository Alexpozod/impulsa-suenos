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
      user_email,
      image_url
    } = body

    console.log("📩 CREATE CAMPAIGN:", body)

    // 🧼 NORMALIZAR DATOS
    title = title?.trim()
    description = description?.trim()
    user_email = user_email?.trim().toLowerCase()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    // 🚨 VALIDACIÓN FUERTE
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

    // 🔒 VALIDAR KYC
    const { data: kyc, error: kycError } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (kycError || !kyc || kyc.status !== "approved") {
      console.log("⛔ KYC BLOQUEADO:", kyc)

      return NextResponse.json(
        { error: "Debes tener KYC aprobado para crear campañas" },
        { status: 403 }
      )
    }

    // 🎯 CREAR CAMPAÑA
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        title,
        description,
        goal_amount,
        total_tickets,
        user_email, // 🔥 CRÍTICO PARA WALLET
        image_url: image_url || null,
        status: "active"
      })
      .select()
      .single()

    if (error) {
      console.error("❌ ERROR INSERT:", error)

      return NextResponse.json(
        { error: error.message },
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
