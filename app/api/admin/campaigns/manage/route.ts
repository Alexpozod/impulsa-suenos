import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export async function POST(req: Request) {
  try {

    const body = await req.json()
    const { action, campaign_id } = body

    if (!action || !campaign_id) {
      return NextResponse.json(
        { error: "missing data" },
        { status: 400 }
      )
    }

    /* =========================
       🔐 AUTH
    ========================= */

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token)

    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = userData.user.email.toLowerCase()

    /* =========================
       🔐 ADMIN CHECK
    ========================= */

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("email", user_email)
      .maybeSingle()

    if (profileError) {
      console.error("❌ PROFILE ERROR:", profileError)
      return NextResponse.json({ error: "profile error" }, { status: 500 })
    }

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
      )
    }

    /* =========================
       🎯 ACCIONES
    ========================= */

    let dbResult: any = null

    if (action === "block") {
      dbResult = await supabaseAdmin
        .from("campaigns")
        .update({
          status: "blocked",
          updated_at: new Date().toISOString()
        })
        .eq("id", campaign_id)
    }

    else if (action === "activate") {
      dbResult = await supabaseAdmin
        .from("campaigns")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", campaign_id)
    }

    else if (action === "delete") {
      dbResult = await supabaseAdmin
        .from("campaigns")
        .update({
          status: "deleted",
          deleted_at: new Date().toISOString()
        })
        .eq("id", campaign_id)
    }

    else {
      return NextResponse.json(
        { error: "invalid action" },
        { status: 400 }
      )
    }

    /* =========================
       ❌ ERROR DB
    ========================= */

    if (dbResult?.error) {
      console.error("❌ DB ERROR:", dbResult.error)

      return NextResponse.json(
        { error: dbResult.error.message },
        { status: 500 }
      )
    }

    /* =========================
       🧾 AUDITORÍA
    ========================= */

    await supabaseAdmin.from("audit_logs").insert({
      action,
      entity: "campaign",
      entity_id: campaign_id,
      user_email,
      metadata: body,
      created_at: new Date().toISOString()
    })

    /* =========================
       ✅ RESPONSE
    ========================= */

    return NextResponse.json({
      success: true,
      action,
      campaign_id
    })

  } catch (error: any) {

    console.error("❌ ADMIN CAMPAIGN ERROR:", error)

    return NextResponse.json(
      { error: error.message || "server error" },
      { status: 500 }
    )
  }
}