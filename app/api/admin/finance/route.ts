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
      .eq("status", "confirmed")

    if (!ledger || ledger.length === 0) {
      console.log("⚠️ Ledger vacío")
      return NextResponse.json({
        totalIncome: 0,
        totalWithdrawals: 0,
        totalUSD: 0,
        totalFees: 0,
        totalTips: 0,
        balance: 0,
        totalPayments: 0,
        providers: {},
        daily: {},
        recentPayments: [],
        errors: [],
        payouts: [],
        issues: []
      })
    }

    console.log("🔥 LEDGER TOTAL:", ledger.length)

    /* =========================
       🔥 FILTROS ROBUSTOS
    ========================= */

    const deposits = ledger.filter(l =>
      (
        l.type === "payment" ||
        l.flow_type === "in"
      ) &&
      Number(l.amount) > 0
    )

    const withdrawals = ledger.filter(l =>
      l.type === "withdraw" ||
      l.flow_type === "out"
    )

    const fees = ledger.filter(l =>
      l.type === "fee_platform"
    )

    console.log("💰 deposits:", deposits.length)
    console.log("💸 withdrawals:", withdrawals.length)

    /* =========================
       📊 MÉTRICAS
    ========================= */

    const totalIncome = deposits.reduce(
      (acc, d) => acc + Number(d.amount || 0),
      0
    )

    const totalWithdrawals = withdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalUSD = deposits.reduce(
      (acc, d) => acc + Number(d.amount_usd || 0),
      0
    )

    const totalFees = fees.reduce(
      (acc, f) => acc + Math.abs(Number(f.amount || 0)),
      0
    )

    const totalTips = deposits.reduce(
      (acc, d) => acc + Number(d.metadata?.tip || 0),
      0
    )

    const balance = totalIncome - totalWithdrawals - totalFees

    /* =========================
       💳 PROVIDERS
    ========================= */

    const providers: any = {}

    deposits.forEach(d => {
      const provider = d.provider || "unknown"

      if (!providers[provider]) {
        providers[provider] = {
          total: 0,
          total_usd: 0,
          count: 0
        }
      }

      providers[provider].total += Number(d.amount || 0)
      providers[provider].total_usd += Number(d.amount_usd || 0)
      providers[provider].count += 1
    })

    /* =========================
       📅 DAILY
    ========================= */

    const daily: any = {}

    deposits.forEach(d => {
      const day = new Date(d.created_at).toISOString().split("T")[0]

      if (!daily[day]) {
        daily[day] = { total: 0, count: 0 }
      }

      daily[day].total += Number(d.amount || 0)
      daily[day].count += 1
    })

    /* =========================
       💳 PAGOS RECIENTES
    ========================= */

    const recentPayments = deposits
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)

    /* =========================
       🚨 ERRORES
    ========================= */

    const { data: errors } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    /* =========================
       🏦 PAYOUTS
    ========================= */

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    /* =========================
       ⚠️ CONCILIACIÓN
    ========================= */

    const { data: issues } = await supabase
      .from("reconciliation_logs")
      .select("*")
      .eq("status", "open")
      .limit(10)

    return NextResponse.json({
      totalIncome,
      totalWithdrawals,
      totalUSD,
      totalFees,
      totalTips,
      balance,
      totalPayments: deposits.length,
      providers,
      daily,
      recentPayments,
      errors: errors || [],
      payouts: payouts || [],
      issues: issues || []
    })

  } catch (error) {
    console.error("ADMIN FINANCE ERROR:", error)

    return NextResponse.json(
      { error: "finance error" },
      { status: 500 }
    )
  }
}