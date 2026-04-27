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
       🧠 AGRUPAR POR OWNER REAL
    ========================= */
    const map: Record<string, number> = {}

    for (const row of ledger as any[]) {

      const email =
        row.campaigns?.user_email ||
        "platform"

      if (!map[email]) {
        map[email] = 0
      }

      // 🔥 CRÍTICO: amount ya viene con signo correcto
      map[email] += Number(row.amount || 0)
    }

    /* =========================
       🔄 UPSERT WALLETS
    ========================= */
    let updated = 0

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
            balance: balance, // 🔥 usa ESTE campo (no available_balance)
            updated_at: new Date().toISOString()
          })
          .eq("user_email", email)
      } else {
        await supabase
          .from("wallets")
          .insert({
            user_email: email,
            balance: balance,
            created_at: new Date().toISOString()
          })
      }

      updated++
    }

    return NextResponse.json({
      ok: true,
      updated
    })

  } catch (error) {
    console.error("FIX ERROR:", error)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}