import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const { data } = await supabase
    .from("campaign_updates")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return NextResponse.json(data)
}

export async function POST(req: Request) {

  const { id, action } = await req.json()

  const { data: update } = await supabase
    .from("campaign_updates")
    .select("*")
    .eq("id", id)
    .single()

  if (!update) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  if (action === "approve") {

    await supabase
      .from("campaigns")
      .update({
        title: update.title,
        description: update.description,
        image_url: update.image_url,
        images: update.images
      })
      .eq("id", update.campaign_id)

  }

  await supabase
    .from("campaign_updates")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id)

  return NextResponse.json({ ok: true })
}