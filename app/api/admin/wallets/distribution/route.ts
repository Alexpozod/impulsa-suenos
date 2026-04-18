import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📥 LEDGER
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount, flow_type, type")
      .eq("status", "confirmed")

    if (!ledger) {
      return NextResponse.json([])
    }

    let totalIn = 0
    let totalOut = 0

    for (const row of ledger) {

      const amount = Number(row.amount || 0)

      // 🔥 ignorar pending
      if (row.type === "withdraw_pending") continue

      if (row.flow_type === "in") {
        totalIn += amount
      }

      if (row.flow_type === "out") {
        totalOut += Math.abs(amount)
      }
    }

    return NextResponse.json({
      totalIn,
      totalOut,
      balance: totalIn - totalOut
    })

  } catch (error) {
    console.error("wallet distribution error", error)
    return NextResponse.json([])
  }
}