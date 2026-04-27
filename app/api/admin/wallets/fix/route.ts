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
        type,
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
       🧠 AGRUPACIÓN CORRECTA
       SOLO DINERO REAL
    ========================= */
    const balances: Record<string, number> = {}

    for (const row of ledger as any[]) {

      const email =
        row.campaigns?.user_email ||
        "platform"

      if (!balances[email]) {
        balances[email] = 0
      }

      const amount = Number(row.amount || 0)

      // 💰 SOLO LO QUE REALMENTE LE PERTENECE AL CREADOR
      if (row.type === "creator_net") {
        balances[email] += amount
      }

      // 💰 TIPS TAMBIÉN SON DEL CREADOR
      if (row.type === "tip") {
        balances[email] += amount
      }
    }

    /* =========================
       🏦 PLATFORM (COMISIONES)
    ========================= */
    const platformBalance = (ledger as any[])
      .filter((l) =>
        l.type === "fee_platform" ||
        l.type === "fee_platform_iva" ||
        l.type === "fee_mp"
      )
      .reduce((acc, l) => acc + Math.abs(Number(l.amount || 0)), 0)

    balances["platform"] = platformBalance

    /* =========================
       📊 TOTAL EARNED (solo payments)
    ========================= */
    const earnings: Record<string, number> = {}

    for (const row of ledger as any[]) {

      const email =
        row.campaigns?.user_email ||
        "platform"

      if (!earnings[email]) {
        earnings[email] = 0
      }

      if (row.type === "payment") {
        earnings[email] += Number(row.amount || 0)
      }
    }

    /* =========================
       🔄 UPSERT WALLETS
    ========================= */
    let updated = 0

    for (const email of Object.keys(balances)) {

      const balance = balances[email]
      const totalEarned = earnings[email] || 0

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