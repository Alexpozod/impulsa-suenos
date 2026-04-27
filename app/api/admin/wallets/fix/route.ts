import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* =========================
       📥 LEDGER + OWNER REAL
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        amount,
        campaign_id,
        type,
        campaigns (
          user_email
        )
      `)
      .eq("status", "confirmed")

    if (error || !ledger) {
      return NextResponse.json(
        { error: "ledger error" },
        { status: 500 }
      )
    }

    /* =========================
       🧠 AGRUPAR POR USUARIO REAL
    ========================= */
    const balances: Record<string, number> = {}
    const earnings: Record<string, number> = {}

    for (const row of ledger as any[]) {

      const email =
        row.campaigns?.user_email ||
        "platform"

      if (!balances[email]) balances[email] = 0
      if (!earnings[email]) earnings[email] = 0

      const amount = Number(row.amount || 0)

      // 🔥 BALANCE REAL
      balances[email] += amount

      // 🔥 TOTAL EARNED (solo ingresos reales del usuario)
      if (row.type === "payment") {
        earnings[email] += amount
      }
    }

    /* =========================
       🔄 UPSERT WALLETS
    ========================= */
    let updated = 0

    for (const email of Object.keys(balances)) {

      const balance = balances[email]
      const totalEarned = earnings[email]

      const { data: existing } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_email", email)
        .maybeSingle()

      if (existing) {
        await supabase
          .from("wallets")
          .update({
            balance: balance,
            total_earned: totalEarned,
            updated_at: new Date().toISOString()
          })
          .eq("user_email", email)
      } else {
        await supabase
          .from("wallets")
          .insert({
            user_email: email,
            balance: balance,
            total_earned: totalEarned,
            created_at: new Date().toISOString()
          })
      }

      updated++
    }

    return NextResponse.json({
      ok: true,
      updated,
      users: Object.keys(balances).length
    })

  } catch (error) {
    console.error("WALLET FIX ERROR:", error)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}