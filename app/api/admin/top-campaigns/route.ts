import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select("campaign_id, amount")
      .eq("type", "payment")

    if (error) {
      console.error("Ledger error:", error)
      return NextResponse.json([], { status: 200 })
    }

    if (!ledger || ledger.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const map: Record<string, { total: number; count: number }> = {}

    for (const l of ledger) {

      if (!l.campaign_id) continue

      if (!map[l.campaign_id]) {
        map[l.campaign_id] = {
          total: 0,
          count: 0
        }
      }

      map[l.campaign_id].total += Number(l.amount || 0)
      map[l.campaign_id].count += 1
    }

    const result = Object.entries(map)
      .map(([campaign_id, val]) => ({
        campaign_id,
        total: val.total,
        count: val.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return NextResponse.json(result)

  } catch (error) {
    console.error("TOP CAMPAIGNS ERROR:", error)
    return NextResponse.json([], { status: 200 })
  }
}