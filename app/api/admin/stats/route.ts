import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function GET() {
  try {

    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select("*")

    if (error) {
      console.error("❌ SUPABASE ERROR:", error)
      return NextResponse.json({ error: "db error" }, { status: 500 })
    }

    const payments = ledger?.filter(l => l.type === "payment") || []
    const feePlatform = ledger?.filter(l => l.type === "fee_platform") || []
    const tips = ledger?.filter(l => l.type === "tip") || []

    const totalDonations = payments.reduce((acc, l) => acc + Number(l.amount || 0), 0)
    const totalCommissions = feePlatform.reduce((acc, l) => acc + Math.abs(Number(l.amount || 0)), 0)
    const totalTips = tips.reduce((acc, l) => acc + Number(l.amount || 0), 0)

    const totalWithdrawals = 0
    const totalRisky = 0

    const history = payments
      .slice(-10)
      .map(l => ({
        amount: l.amount,
        created_at: l.created_at
      }))
      .reverse()

    return NextResponse.json({
      totalCommissions,
      totalWithdrawals,
      totalDonations,
      totalRisky,
      totalTips,
      history
    })

  } catch (err) {
    console.error("❌ ERROR STATS:", err)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}