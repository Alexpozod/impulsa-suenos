import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* 🔥 TRAER PAGOS */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("campaign_id, amount")
      .eq("type", "payment")

    if (!ledger || ledger.length === 0) {
      return NextResponse.json([])
    }

    /* 🧠 AGRUPAR */
    const map: any = {}

    ledger.forEach((l) => {

      if (!l.campaign_id) return

      if (!map[l.campaign_id]) {
        map[l.campaign_id] = {
          total: 0,
          count: 0
        }
      }

      map[l.campaign_id].total += Number(l.amount || 0)
      map[l.campaign_id].count += 1
    })

    /* 🔥 OBTENER CAMPAÑAS */
    const ids = Object.keys(map)

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", ids)

    const campaignMap: any = {}

    campaigns?.forEach(c => {
      campaignMap[c.id] = c.title
    })

    /* 🏆 RESULTADO FINAL */
    const result = Object.entries(map)
      .map(([campaign_id, val]: any) => ({
        campaign_id,
        title: campaignMap[campaign_id] || "Campaña",
        total: val.total,
        count: val.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return NextResponse.json(result)

  } catch (error) {
    console.error("TOP CAMPAIGNS ERROR:", error)
    return NextResponse.json([])
  }
}