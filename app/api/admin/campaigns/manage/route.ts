import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
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
       🎯 ACCIONES
    ========================= */

    if (action === "block") {
      await supabase
        .from("campaigns")
        .update({ status: "blocked" })
        .eq("id", campaign_id)
    }

    if (action === "activate") {
      await supabase
        .from("campaigns")
        .update({ status: "active" })
        .eq("id", campaign_id)
    }

    if (action === "delete") {
      await supabase
        .from("campaigns")
        .update({ status: "deleted" })
        .eq("id", campaign_id)
    }

    /* =========================
       🧾 AUDITORÍA
    ========================= */

    await supabase.from("audit_logs").insert({
      action,
      entity: "campaign",
      entity_id: campaign_id,
      metadata: body,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("❌ ADMIN CAMPAIGN ERROR:", error)

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}