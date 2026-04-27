import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    /* =========================
       📥 LEDGER REAL (FUENTE ÚNICA)
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        user_email,
        amount,
        status,
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
       🧠 AGRUPACIÓN CORRECTA
    ========================= */
    const map: Record<string, number> = {}

    for (const row of ledger as any[]) {

      // 🔥 FIX REAL (CLAVE)
      const campaignUser = row.campaigns?.user_email || null

      const email =
        campaignUser ||
        row.user_email ||
        "platform"

      if (!map[email]) {
        map[email] = 0
      }

      // 🔥 amount YA VIENE CON SIGNO CORRECTO
      map[email] += Number(row.amount || 0)
    }

    /* =========================
       🔄 SYNC TOTAL (UPSERT)
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