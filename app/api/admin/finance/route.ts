import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 💰 ledger
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")

    const deposits = ledger?.filter(l => l.type === "deposit") || []
    const withdrawals = ledger?.filter(l => l.type === "withdraw") || []

    const totalIncome = deposits.reduce((acc, d) => acc + Number(d.amount), 0)
    const totalWithdrawals = withdrawals.reduce((acc, w) => acc + Number(w.amount), 0)

    const balance = totalIncome - totalWithdrawals

    // 💳 pagos recientes
    const { data: payments } = await supabase
      .from("financial_ledger")
      .select("*")
      .eq("type", "deposit")
      .order("created_at", { ascending: false })
      .limit(10)

    // 🚨 errores
    const { data: errors } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // 🏦 payouts
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // ⚠️ conciliación
    const { data: issues } = await supabase
      .from("reconciliation_logs")
      .select("*")
      .eq("status", "open")
      .limit(10)

    return NextResponse.json({
      totalIncome,
      totalWithdrawals,
      balance,
      totalPayments: deposits.length,
      recentPayments: payments || [],
      errors: errors || [],
      payouts: payouts || [],
      issues: issues || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: "finance error" },
      { status: 500 }
    )
  }
}