import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic" // 🔥 evita problemas de build

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST() {
  try {

    /* =========================
       📥 LEDGER
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select("user_email, amount, flow_type, type")
      .eq("status", "confirmed")

    if (error || !ledger) {
      return NextResponse.json({ error: "no ledger data" }, { status: 500 })
    }

    /* =========================
       🧠 AGRUPAR
    ========================= */
    const map: Record<string, number> = {}

    for (const row of ledger) {

      const email = row.user_email || "platform"

      if (!map[email]) {
        map[email] = 0
      }

      // ❌ ignorar pending
      if (row.type === "withdraw_pending") continue

      const amount = Number(row.amount || 0)

      if (row.flow_type === "in") {
        map[email] += amount
      }

      if (row.flow_type === "out") {
        map[email] -= Math.abs(amount)
      }
    }

    /* =========================
       🔄 UPDATE WALLETS
    ========================= */
    const results: any[] = []

    for (const email of Object.keys(map)) {

      const balance = map[email]

      const { data: existing } = await supabase
        .from("wallets")
        .select("user_email")
        .eq("user_email", email)
        .maybeSingle()

      if (existing) {
        await supabase
          .from("wallets")
          .update({
            available_balance: balance,
            pending_balance: 0,
            updated_at: new Date().toISOString()
          })
          .eq("user_email", email)
      } else {
        await supabase
          .from("wallets")
          .insert({
            user_email: email,
            available_balance: balance,
            pending_balance: 0,
            created_at: new Date().toISOString()
          })
      }

      results.push({
        user_email: email,
        new_balance: balance
      })
    }

    return NextResponse.json({
      ok: true,
      updated: results.length,
      results
    })

  } catch (error) {
    console.error("RECONCILE ERROR:", error)

    return NextResponse.json(
      { error: "reconcile failed" },
      { status: 500 }
    )
  }
}