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
       🧠 MAPA REAL (TIPOS CORRECTOS)
    ========================= */
    const map: Record<string, any> = {}

    for (const row of ledger) {

      const campaignOwner =
        Array.isArray(row.campaigns) && row.campaigns.length > 0
          ? row.campaigns[0]?.user_email
          : null

      const email =
        campaignOwner ||
        row.user_email ||
        "platform"

      if (!map[email]) {
        map[email] = {
          income: 0,
          withdrawn: 0,
          balance: 0
        }
      }

      const amount = Number(row.amount || 0)

      switch (row.type) {

        /* 💰 DINERO REAL USUARIO */
        case "creator_net":
          map[email].balance += amount
          map[email].income += amount
          break

        /* 💸 RETIROS */
        case "withdraw":
          map[email].balance -= Math.abs(amount)
          map[email].withdrawn += Math.abs(amount)
          break

        /* ⏳ IGNORAR */
        case "withdraw_pending":
        case "withdraw_rejected":
          break

        /* 🏦 PLATFORM (no afecta usuario) */
        case "fee_platform":
        case "fee_platform_iva":
        case "fee_mp":
        case "tip":
          if (!map["platform"]) {
            map["platform"] = { income: 0, withdrawn: 0, balance: 0 }
          }
          map["platform"].balance += Math.abs(amount)
          break

        default:
          break
      }
    }

    /* =========================
       🔍 RESULTADO
    ========================= */
    const result = wallets.map(w => {

      const email = w.user_email || "platform"

      const ledgerData = map[email] || {
        income: 0,
        withdrawn: 0,
        balance: 0
      }

      const walletBalance = ledgerData.balance
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