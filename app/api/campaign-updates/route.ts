import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   GET → PUBLIC (CAMPAÑA)
========================= */
export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const campaign_id = searchParams.get("campaign_id")

  if (!campaign_id) {
    return NextResponse.json([])
  }

  const { data } = await supabase
    .from("campaign_updates")
    .select("*")
    .eq("campaign_id", campaign_id)
    .eq("status", "approved") // 🔥 SOLO aprobados visibles
    .order("created_at", { ascending: false })

  return NextResponse.json(data || [])
}

/* =========================
   POST → CREAR UPDATE
========================= */
export async function POST(req: Request) {

  const body = await req.json()

  const { campaign_id, content } = body

  if (!campaign_id || !content) {
    return NextResponse.json(
      { error: "missing fields" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("campaign_updates")
    .insert({
  campaign_id,
  description: content,
  title: "Actualización",
  status: "approved"
})

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}