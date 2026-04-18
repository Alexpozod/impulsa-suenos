import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📥 TRAER LEDGER
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("campaign_id, amount, type")

    if (!ledger) return NextResponse.json([])

    /* =========================
       🧠 AGRUPAR POR CAMPAÑA
    ========================= */
    const map: any = {}

    for (const row of ledger) {

      if (!row.campaign_id) continue

      if (!map[row.campaign_id]) {
        map[row.campaign_id] = {
          income: 0,
          providerFees: 0,
          platformFees: 0,
          withdrawals: 0
        }
      }

      const amount = Number(row.amount || 0)

      switch (row.type) {

        case "payment":
          map[row.campaign_id].income += amount
          break

        case "fee_mp":
          map[row.campaign_id].providerFees += Math.abs(amount)
          break

        case "fee_platform":
          map[row.campaign_id].platformFees += Math.abs(amount)
          break

        case "withdraw":
          map[row.campaign_id].withdrawals += Math.abs(amount)
          break
      }
    }

    /* =========================
       📦 TRAER CAMPAÑAS
    ========================= */
    const ids = Object.keys(map)

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .in("id", ids)

    const campaignMap: any = {}

    campaigns?.forEach(c => {
      campaignMap[c.id] = c.title
    })

    /* =========================
       📊 CALCULAR MÉTRICAS
    ========================= */
    const result = Object.entries(map).map(([campaign_id, val]: any) => {

      const income = val.income
      const fees = val.providerFees + val.platformFees

      const profit = val.platformFees

      const net = income - fees

      const margin =
        income > 0
          ? (profit / income) * 100
          : 0

      return {
        campaign_id,
        title: campaignMap[campaign_id] || "Campaña",
        income,
        profit,
        net,
        margin,
        withdrawals: val.withdrawals
      }
    })

    /* =========================
       🏆 RANKING
    ========================= */
    const ranking = result
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)

    /* =========================
       🚨 ALERTAS
    ========================= */
    const unhealthy = result.filter(c =>
      c.margin < 5 && c.income > 0
    )

    return NextResponse.json({
      ranking,
      unhealthy,
      total: result.length
    })

  } catch (error) {
    console.error("CAMPAIGN PROFIT ERROR:", error)
    return NextResponse.json([])
  }
}