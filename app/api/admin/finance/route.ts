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
      .select(`
        *,
        campaigns (
          title
        )
      `)
      .eq("status", "confirmed")

    /* =========================
       📊 CAMPAÑAS (FIX CRÍTICO)
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")

    if (!ledger) {
      return NextResponse.json({
        campaigns: campaigns || [],
        totals: {
          balance: 0,
          raised: 0,
          fees: 0,
          withdrawn: 0,
          pending: 0
        }
      })
    }

    /* =========================
       ✅ CLASIFICACIÓN
    ========================= */
    const payments = ledger.filter(l => l.type === "payment")

    const withdrawals = ledger.filter(l => l.type === "withdraw")
    const pendingWithdrawals = ledger.filter(l => l.type === "withdraw_pending")
    const rejectedWithdrawals = ledger.filter(l => l.type === "withdraw_rejected")

    const feePlatform = ledger.filter(l => l.type === "fee_platform")
    const feeMP = ledger.filter(l => l.type === "fee_mp")

    /* =========================
       📊 MÉTRICAS
    ========================= */
    const totalIncome = payments.reduce(
      (acc, d) => acc + Number(d.amount || 0),
      0
    )

    const totalUSD = payments.reduce(
      (acc, d) => acc + Number(d.amount_usd || 0),
      0
    )

    const totalTips = payments.reduce(
      (acc, d) => acc + Number(d.metadata?.tip || 0),
      0
    )

    const totalWithdrawals = withdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalPendingWithdrawals = pendingWithdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalRejectedWithdrawals = rejectedWithdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalPlatformFees = feePlatform.reduce(
      (acc, f) => acc + Math.abs(Number(f.amount || 0)),
      0
    )

    const totalProviderFees = feeMP.reduce(
      (acc, f) => acc + Math.abs(Number(f.amount || 0)),
      0
    )

    const totalFees = totalPlatformFees + totalProviderFees

    const netIncome =
      totalIncome - totalPlatformFees - totalProviderFees

    const balance =
      netIncome - totalWithdrawals

    /* =========================
       💳 PROVIDERS
    ========================= */
    const providers: any = {}

    payments.forEach(d => {
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

    payments.forEach(d => {
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
    const recentPayments = ledger
      .filter(l =>
        l.type === "payment" || l.type === "withdraw"
      )
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)

    /* =========================
       🚨 OTROS DATOS
    ========================= */
    const { data: errors } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: issues } = await supabase
      .from("reconciliation_logs")
      .select("*")
      .eq("status", "open")
      .limit(10)

    return NextResponse.json({
      campaigns: campaigns || [],
      totalIncome,
      totalUSD,
      totalTips,
      totalWithdrawals,
      totalPendingWithdrawals,
      totalRejectedWithdrawals,
      totalFees,
      totalPlatformFees,
      totalProviderFees,
      netIncome,
      balance,
      totals: {
        balance: balance,
        raised: totalIncome,
        fees: totalFees,
        withdrawn: totalWithdrawals,
        pending: totalPendingWithdrawals
      },
      profit: totalPlatformFees,
      margin:
        totalIncome > 0
          ? (totalPlatformFees / totalIncome) * 100
          : 0,
      takeRate:
        totalIncome > 0
          ? ((totalPlatformFees + totalProviderFees) / totalIncome) * 100
          : 0,
      avgFeePerPayment:
        payments.length > 0
          ? totalPlatformFees / payments.length
          : 0,
      totalPayments: payments.length,
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