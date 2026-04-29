import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const statusFilter = url.searchParams.get("status") || "active"

    /* =========================
       📦 TRAER TODAS (para stats)
    ========================= */

    const { data: allCampaigns, error: allError } = await supabase
      .from("campaigns")
      .select("id, status")

    if (allError) {
      console.error("❌ ALL CAMPAIGNS ERROR:", allError)
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }

    /* =========================
       📊 CONTADORES
    ========================= */

    const stats = {
      active: allCampaigns?.filter(c => c.status === "active").length || 0,
      blocked: allCampaigns?.filter(c => c.status === "blocked").length || 0,
      deleted: allCampaigns?.filter(c => c.status === "deleted").length || 0,
      all: allCampaigns?.length || 0
    }

    /* =========================
       🎯 QUERY PRINCIPAL
    ========================= */

    let query = supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error("❌ CAMPAIGNS ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        data: [],
        stats
      })
    }

    /* =========================
       ⚡ LEDGER (OPTIMIZADO)
    ========================= */

    const campaignIds = campaigns.map(c => c.id)

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("campaign_id, amount")
      .in("campaign_id", campaignIds)
      .eq("type", "payment")
      .eq("status", "confirmed")

    const totalsMap: Record<string, number> = {}

    for (const row of ledger || []) {
      if (!totalsMap[row.campaign_id]) {
        totalsMap[row.campaign_id] = 0
      }
      totalsMap[row.campaign_id] += Number(row.amount || 0)
    }

    /* =========================
       🧠 ENRIQUECER
    ========================= */

    const enriched = campaigns.map(c => ({
      ...c,
      total_raised: totalsMap[c.id] || 0
    }))

    /* =========================
       ✅ RESPONSE PRO
    ========================= */

    return NextResponse.json({
      data: enriched,
      stats
    })

  } catch (error: any) {

    console.error("❌ SERVER ERROR:", error)

    return NextResponse.json(
      { error: error.message || "Error servidor" },
      { status: 500 }
    )
  }
}