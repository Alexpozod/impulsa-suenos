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
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        user_email,
        amount,
        type,
        campaign_id,
        campaigns (
          user_email
        )
      `)
      .eq("status", "confirmed")

    const { data: wallets } = await supabase
      .from("wallets")
      .select("*")

    if (error || !ledger || !wallets) {
      console.error("ledger error", error)
      return NextResponse.json({
        users: [],
        issues: [],
        total: 0
      })
    }

    /* =========================
       🧠 MAPA FINANCIERO REAL
    ========================= */
    const map: Record<string, {
      income: number
      withdrawn: number
      balance: number
    }> = {}

    for (const row of ledger) {

      const campaignOwner =
      (row.campaigns as any)?.user_email || null

      const userEmail = campaignOwner || row.user_email

      const amount = Number(row.amount || 0)

      /* =========================
         👤 USUARIO → SOLO creator_net
      ========================= */
      if (row.type === "creator_net" && userEmail) {

        if (!map[userEmail]) {
          map[userEmail] = { income: 0, withdrawn: 0, balance: 0 }
        }

        map[userEmail].balance += amount
        map[userEmail].income += amount
      }

      /* =========================
         💸 RETIROS USUARIO
      ========================= */
      if (row.type === "withdraw" && userEmail) {

        if (!map[userEmail]) {
          map[userEmail] = { income: 0, withdrawn: 0, balance: 0 }
        }

        map[userEmail].balance += amount
        map[userEmail].withdrawn += Math.abs(amount)
      }

      /* =========================
         🏦 PLATFORM → SOLO FEES + TIPS
      ========================= */
      if (
        row.type === "fee_platform" ||
        row.type === "fee_platform_iva" ||
        row.type === "fee_mp" ||
        row.type === "tip"
      ) {

        if (!map["platform"]) {
          map["platform"] = { income: 0, withdrawn: 0, balance: 0 }
        }

        map["platform"].balance += Math.abs(amount)
      }
    }

    /* =========================
       🔍 RESULTADO FINAL
    ========================= */
    const result = wallets.map(w => {

      const email = w.user_email || "platform"

      const ledgerData = map[email] || {
        income: 0,
        withdrawn: 0,
        balance: 0
      }

      const walletBalance = Number(w.balance || 0)
      const ledgerBalance = ledgerData.balance

      const diff = Math.abs(walletBalance - ledgerBalance)

      let status = "ok"
      if (diff > 1) status = "mismatch"
      if (diff > 10) status = "critical"

      return {
        user_email: email,

        wallet_balance: walletBalance,
        ledger_balance: ledgerBalance,
        difference: diff,

        total_received: ledgerData.income,
        total_withdrawn: ledgerData.withdrawn,

        // informativo (no usado en cálculo)
        available: Number(w.available_balance || 0),
        pending: Number(w.pending_balance || 0),

        status
      }
    })

    const issues = result.filter(r => r.status !== "ok")

    return NextResponse.json({
      users: result,
      issues,
      total: result.length
    })

  } catch (error) {
    console.error("wallet users error", error)

    return NextResponse.json({
      users: [],
      issues: [],
      total: 0
    })
  }
}