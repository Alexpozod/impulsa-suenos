import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"

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
      total_tickets,
      image_url
    } = body

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      logError("No auth header")
      await logErrorToDB("No auth header", {})
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token)

    if (userError || !userData?.user?.email) {
      logError("Usuario no válido", userError)
      await logErrorToDB("Usuario no válido", userError)
      return NextResponse.json({ error: "Usuario no válido" }, { status: 401 })
    }

    const user_email = userData.user.email.toLowerCase()

    title = title?.trim()
    description = description?.trim()
    goal_amount = Number(goal_amount)
    total_tickets = Number(total_tickets)

    if (!title || !description || !goal_amount || !total_tickets) {
      logError("Campos inválidos", body)
      await logErrorToDB("Campos inválidos", body)
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
    }

    const { data: kyc } = await supabaseAdmin
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (!kyc || kyc.status !== "approved") {
      logError("KYC no aprobado", { user_email })
      await logErrorToDB("KYC no aprobado", { user_email })
      return NextResponse.json({ error: "KYC requerido" }, { status: 403 })
    }

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
      logError("Error creando campaña", error)
      await logErrorToDB("Error creando campaña", error)
      return NextResponse.json({ error: "Error creando campaña" }, { status: 500 })
    }

    logInfo("Campaña creada", { campaign_id: campaign.id, user_email })
    await logToDB("info", "Campaña creada", {
      campaign_id: campaign.id,
      user_email
    })

    return NextResponse.json({ ok: true, campaign })

  } catch (err) {
    logError("Error servidor", err)
    await logErrorToDB("Error servidor", err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}