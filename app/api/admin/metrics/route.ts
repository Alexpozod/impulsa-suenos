import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       💰 LEDGER (REAL)
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .eq("type", "payment")
      .order("created_at", { ascending: true })

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")

    /* =========================
       📊 MÉTRICAS
    ========================= */
    const totalRevenue =
      ledger?.reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    /* =========================
       📈 AGRUPAR POR DÍA
    ========================= */
    const daily: Record<string, number> = {}

    ledger?.forEach((l) => {
      const date = new Date(l.created_at).toISOString().slice(0, 10)

      if (!daily[date]) {
        daily[date] = 0
      }

      daily[date] += Number(l.amount || 0)
    })

    const chart = Object.entries(daily).map(([date, value]) => ({
      date,
      ingresos: value,
    }))

    /* =========================
       🚨 ALERTAS REALES
    ========================= */
    const alerts: any[] = []

    ledger?.forEach((l) => {
      if (Number(l.amount) > 1000000) {
        alerts.push({
          type: "high_payment",
          message: `Pago alto detectado: $${l.amount}`,
        })
      }
    })

    /* =========================
       🔥 TOP CAMPAÑAS
    ========================= */
    const campaignMap: Record<string, number> = {}

    ledger?.forEach((l) => {
      if (!l.campaign_id) return

      if (!campaignMap[l.campaign_id]) {
        campaignMap[l.campaign_id] = 0
      }

      campaignMap[l.campaign_id] += Number(l.amount || 0)
    })

    const topCampaigns = Object.entries(campaignMap)
      .map(([id, total]) => {
        const campaign = campaigns?.find(c => c.id === id)
        return {
          id,
          title: campaign?.title || "Sin nombre",
          total,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return NextResponse.json({
      totalRevenue,
      chart,
      alerts,
      topCampaigns,
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}