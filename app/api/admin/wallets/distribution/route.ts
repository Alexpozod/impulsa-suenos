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
      .select("amount, type")
      .eq("status", "confirmed")

    if (!ledger) {
      return NextResponse.json({})
    }

    let campaignFunds = 0
    let platformFunds = 0

    for (const row of ledger) {

      const amount = Number(row.amount || 0)

      switch (row.type) {

        // 💰 dinero real en campañas
        case "payment":
          campaignFunds += amount
          break

        case "fee_platform":
        case "fee_mp":
          campaignFunds -= Math.abs(amount)
          break

        case "withdraw":
          campaignFunds -= Math.abs(amount)
          break

        // 🟢 dinero real de la plataforma
        case "fee_platform_income":
          platformFunds += amount
          break

        case "tip_income":
          platformFunds += amount
          break
      }
    }

    /* =========================
       🔥 FIX CORRECTO
       PENDING DESDE PAYOUTS
    ========================= */
    const { data: payouts } = await supabase
      .from("payouts")
      .select("amount")
      .eq("status", "pending")

    let pendingWithdrawals = 0

    for (const p of payouts || []) {
      pendingWithdrawals += Number(p.amount || 0)
    }

    return NextResponse.json({
      campaignFunds,
      platformFunds,
      pendingWithdrawals
    })

  } catch (error) {
    console.error("wallet distribution error", error)
    return NextResponse.json({})
  }
}