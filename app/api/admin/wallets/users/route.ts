import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📥 LEDGER (FIX REAL)
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        user_email,
        amount,
        flow_type,
        type,
        campaign_id,
        campaigns (
          user_email
        )
      `)
      .eq("status", "confirmed")

    /* =========================
       👛 WALLETS (NO SE ELIMINA)
    ========================= */
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
       🧠 AGRUPAR LEDGER CORRECTO
    ========================= */
    const map: Record<string, any> = {}

    for (const row of ledger) {

      // 🔥 FIX CRÍTICO: usar dueño real de campaña
      const campaignOwner =
        Array.isArray(row.campaigns) && row.campaigns.length > 0
          ? row.campaigns[0]?.user_email
          : row.campaigns?.user_email

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

      // ignorar pendientes
      if (row.type === "withdraw_pending") continue

      const amount = Number(row.amount || 0)

      // 🔥 balance real desde ledger
      map[email].balance += amount

      if (row.flow_type === "in") {
        map[email].income += amount
      }

      if (row.flow_type === "out") {
        map[email].withdrawn += Math.abs(amount)
      }
    }

    /* =========================
       🔍 CONSTRUIR RESULTADO
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

        // informativo
        available: Number(w.available_balance || 0),
        pending: Number(w.pending_balance || 0),

        status
      }
    })

    /* =========================
       🚨 SOLO ERRORES REALES
    ========================= */
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