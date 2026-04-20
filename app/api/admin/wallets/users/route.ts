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
      .select("user_email, amount, flow_type, type")
      .eq("status", "confirmed")

    /* =========================
       👛 WALLETS
    ========================= */
    const { data: wallets } = await supabase
      .from("wallets")
      .select("*")

    if (!ledger || !wallets) {
      return NextResponse.json([])
    }

    /* =========================
       🧠 AGRUPAR LEDGER
    ========================= */
    const map: any = {}

    for (const row of ledger) {

      const email = row.user_email || "unknown"

      if (!map[email]) {
        map[email] = {
          income: 0,
          withdrawn: 0,
          balance: 0
        }
      }

      const amount = Number(row.amount || 0)

      // 🔥 ignorar pending
      if (row.type === "withdraw_pending") continue

      if (row.flow_type === "in") {
        map[email].income += amount
        map[email].balance += amount
      }

      if (row.flow_type === "out") {
        map[email].withdrawn += Math.abs(amount)
        map[email].balance -= Math.abs(amount)
      }
    }

    /* =========================
       🔍 COMPARAR
    ========================= */
    const result = wallets.map(w => {

      const email = w.user_email

      const ledgerData = map[email] || {
        income: 0,
        withdrawn: 0,
        balance: 0
      }

      const walletBalance = Number(w.balance || 0)

      const diff = ledgerData.balance - walletBalance

      let status = "ok"

      if (Math.abs(diff) > 1) {
        status = "mismatch"
      }

      if (Math.abs(diff) > 10) {
        status = "critical"
      }

      return {
        user_email: email,

        wallet_balance: walletBalance,
        ledger_balance: ledgerData.balance,

        difference: diff,

        total_received: ledgerData.income,
        total_withdrawn: ledgerData.withdrawn,

        available: Number(w.available_balance || 0),
        pending: Number(w.pending_balance || 0),

        status
      }
    })

    /* =========================
       🚨 SOLO PROBLEMAS
    ========================= */
    const issues = result.filter(r => r.status !== "ok")

    return NextResponse.json({
      users: result,
      issues,
      total: result.length
    })

  } catch (error) {
    console.error("wallet users error", error)
    return NextResponse.json([])
  }
}