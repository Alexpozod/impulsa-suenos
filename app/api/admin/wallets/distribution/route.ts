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
      .select("amount, type")
      .eq("status", "confirmed")

    if (error || !ledger) {
      console.error("ledger error", error)
      return NextResponse.json({
        campaignFunds: 0,
        platformFunds: 0,
        pendingWithdrawals: 0
      })
    }

    let campaignFunds = 0
    let platformFunds = 0

    for (const row of ledger) {

      const amount = Number(row.amount || 0)

      switch (row.type) {

        /* =========================
           👤 USUARIOS (REAL)
        ========================= */
        case "creator_net":
          campaignFunds += amount
          break

        case "withdraw":
          campaignFunds -= Math.abs(amount)
          break

        /* =========================
           🏦 PLATFORM (REAL)
        ========================= */
        case "fee_platform":
        case "fee_platform_iva":
        case "fee_mp":
        case "tip":
          platformFunds += Math.abs(amount)
          break

        default:
          break
      }
    }

    /* =========================
       ⏳ PENDING DESDE PAYOUTS
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

    return NextResponse.json({
      campaignFunds: 0,
      platformFunds: 0,
      pendingWithdrawals: 0
    })
  }
}