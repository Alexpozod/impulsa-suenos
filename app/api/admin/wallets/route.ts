import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📥 LEDGER + RELACIÓN REAL
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        user_email,
        amount,
        status,
        campaign_id,
        campaigns (
          user_email
        )
      `)
      .eq("status", "confirmed")

    if (error) {
      console.error("Ledger error:", error)
      return NextResponse.json(
        { error: "ledger_error" },
        { status: 500 }
      )
    }

    /* =========================
       🧠 AGRUPACIÓN PRO (REAL)
    ========================= */
    const map: Record<string, number> = {}

    for (const row of ledger || []) {

      // 🔥 PRIORIDAD:
      // 1. campaign.user_email (real)
      // 2. user_email directo (fallback)
      // 3. platform (si no hay nada)
      const email =
        row.campaigns?.user_email ||
        row.user_email ||
        "platform"

      if (!map[email]) {
        map[email] = 0
      }

      // 🔥 IMPORTANTE: amount ya viene con signo correcto
      map[email] += Number(row.amount || 0)
    }

    /* =========================
       📊 FORMATEO
    ========================= */
    const wallets = Object.entries(map)
      .map(([user_email, balance]) => ({
        user_email,
        balance
      }))
      .sort((a, b) => b.balance - a.balance)

    const total = wallets.reduce(
      (acc, w) => acc + w.balance,
      0
    )

    /* =========================
       🛡️ VALIDACIÓN INTERNA (PRO)
    ========================= */
    if (ledger && ledger.length > 0 && total === 0) {
      console.warn("⚠️ Wallet total = 0 con ledger existente → posible inconsistencia")
    }

    return NextResponse.json({
      wallets,
      total
    })

  } catch (error) {
    console.error("ADMIN WALLET ERROR:", error)

    return NextResponse.json(
      { error: "wallet_error" },
      { status: 500 }
    )
  }
}