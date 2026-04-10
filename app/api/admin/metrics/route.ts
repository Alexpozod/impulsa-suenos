import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")

    const payments = ledger?.filter(l => l.type === "payment") || []
    const tips = ledger?.filter(l => l.type === "tip") || []
    const feePlatform = ledger?.filter(l => l.type === "fee_platform") || []

    const totalRevenue = payments.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    const totalTips = tips.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    const totalPlatformFees = feePlatform.reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0)

    const platformRevenue = totalTips + totalPlatformFees

    const daily: Record<string, number> = {}

    payments.forEach((l) => {
      const date = new Date(l.created_at).toISOString().slice(0, 10)

      if (!daily[date]) daily[date] = 0
      daily[date] += Number(l.amount || 0)
    })

    const chart = Object.entries(daily).map(([date, value]) => ({
      date,
      ingresos: value,
    }))

    return NextResponse.json({
      totalRevenue,
      totalTips,
      totalPlatformFees,
      platformRevenue,
      chart
    })

  } catch (error) {
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}