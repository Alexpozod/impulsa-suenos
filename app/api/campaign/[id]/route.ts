import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🧠 TRUST SCORE
========================= */
function calculateTrustScore(campaign: any, current_amount: number, donationsCount: number) {

  let score = 50

  score += Math.min(current_amount / 1000, 20)
  score += Math.min(donationsCount * 2, 20)

  if (campaign.images?.length >= 3) score += 10
  if (campaign.description?.length > 200) score += 10

  if (campaign.risk_score > 70) score -= 30

  return Math.max(0, Math.min(100, Math.round(score)))
}

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)

    // 🔥 FIX REAL (estable)
    const id = url.pathname.split("/campaign/")[1]?.split("?")[0]

    if (!id) {
      return NextResponse.json(null, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !campaign) {
      return NextResponse.json(null, { status: 200 })
    }

    /* =========================
       💰 DONACIONES
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", id)
      .eq("type", "payment")
      .eq("status", "confirmed")

    const current_amount =
      ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

    /* =========================
       🎉 DONACIONES LISTA
    ========================= */
    const { data: donations } = await supabase
      .from("financial_ledger")
      .select("amount, user_email, created_at")
      .eq("campaign_id", id)
      .eq("type", "payment")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(10)

    /* =========================
       ⚠️ CAMBIOS PENDIENTES
    ========================= */
    const { data: pending } = await supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    /* =========================
       🖼️ IMÁGENES
    ========================= */
    const images = Array.isArray(campaign.images) && campaign.images.length > 0
      ? campaign.images
      : campaign.image_url
        ? [campaign.image_url]
        : []

    /* =========================
       ⭐ TRUST SCORE
    ========================= */
    const trust_score = calculateTrustScore(
      campaign,
      current_amount,
      donations?.length || 0
    )

    return NextResponse.json({
      ...campaign,
      current_amount,
      goal_amount: Number(campaign.goal_amount || 0),
      donations: donations || [],
      images,
      pending_update: pending || null,
      trust_score
    })

  } catch (err) {
    console.error("CAMPAIGN DETAIL ERROR:", err)
    return NextResponse.json(null, { status: 200 })
  }
}