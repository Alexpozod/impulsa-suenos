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

export async function GET() {
  try {

    /* =========================
       📊 CAMPAÑAS
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")

    if (!campaigns) {
      return NextResponse.json([])
    }

    /* =========================
       💰 TODAS LAS DONACIONES
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("campaign_id, amount")
      .eq("flow_type", "in")
      .eq("status", "confirmed")

    const map: any = {}

    ledger?.forEach((d) => {
      if (!map[d.campaign_id]) {
        map[d.campaign_id] = {
          amount: 0,
          count: 0
        }
      }

      map[d.campaign_id].amount += Number(d.amount)
      map[d.campaign_id].count += 1
    })

    /* =========================
       🧠 ENRIQUECER + RANKING
    ========================= */
    const enriched = campaigns.map((c) => {

      const stats = map[c.id] || { amount: 0, count: 0 }

      const current_amount = stats.amount
      const donations_count = stats.count

      const progress = c.goal_amount > 0
        ? Math.min((current_amount / Number(c.goal_amount)) * 100, 100)
        : 0

      const trust = calculateTrustScore(c, current_amount, donations_count)

      /* 🔥 SCORE FINAL */
      const ranking_score =
        (current_amount * 0.4) +
        (donations_count * 10) +
        (trust * 2)

      return {
        ...c,
        current_amount,
        donations_count,
        progress,
        trust_score: trust,
        ranking_score
      }
    })

    /* =========================
       🔥 ORDEN AUTOMÁTICO
    ========================= */
    enriched.sort((a, b) => b.ranking_score - a.ranking_score)

    return NextResponse.json(enriched)

  } catch (error) {
    console.error(error)
    return NextResponse.json([], { status: 200 })
  }
}