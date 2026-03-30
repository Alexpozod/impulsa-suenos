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

    // NORMALIZAR
    title = title?.trim()
    description = description?.trim()
    user_email = user_email?.trim().toLowerCase()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    // VALIDACIÓN
    if (
      !title ||
      !description ||
      !user_email ||
      isNaN(goal_amount) ||
      isNaN(total_tickets) ||
      goal_amount <= 0 ||
      total_tickets <= 0
    ) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // KYC
    const { data: kyc, error: kycError } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (kycError) {
      return NextResponse.json(
        { error: "Error validando KYC" },
        { status: 500 }
      )
    }

    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json(
        { error: "KYC no aprobado" },
        { status: 403 }
      )
    }

    // INSERT
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
      return NextResponse.json(
        { error: error.message },
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
