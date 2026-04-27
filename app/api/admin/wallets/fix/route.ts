import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

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
        user_email,
        amount,
        campaign_id,
        campaigns (
          user_email
        )
      `)
      .eq("status", "confirmed")

    if (error || !ledger) {
      console.error("Ledger error:", error)
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

      // 🔥 FIX REAL: campaigns SIEMPRE ES ARRAY
      let campaignUser: string | null = null

      if (Array.isArray(row.campaigns) && row.campaigns.length > 0) {
        campaignUser = row.campaigns[0]?.user_email || null
      }

      // 🔥 PRIORIDAD CORRECTA
      const email =
        campaignUser ||          // dueño campaña (CORRECTO)
        row.user_email ||        // fallback legacy
        "platform"               // último fallback

      if (!map[email]) {
        map[email] = 0
      }

      // 🔥 amount YA VIENE CON SIGNO CORRECTO
      map[email] += Number(row.amount || 0)
    }

    /* =========================
       🔄 SYNC TOTAL (UPSERT REAL)
    ========================= */
    let updated = 0

    for (const email of Object.keys(map)) {

      const balance = map[email]

      const { data: existing, error: findError } = await supabase
        .from("wallets")
        .select("user_email")
        .eq("user_email", email)
        .maybeSingle()

      if (findError) {
        console.error("Find wallet error:", findError)
        continue
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("wallets")
          .update({
            available_balance: balance,
            pending_balance: 0,
            updated_at: new Date().toISOString()
          })
          .eq("user_email", email)

        if (updateError) {
          console.error("Update wallet error:", updateError)
          continue
        }

      } else {
        const { error: insertError } = await supabase
          .from("wallets")
          .insert({
            user_email: email,
            available_balance: balance,
            pending_balance: 0,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error("Insert wallet error:", insertError)
          continue
        }
      }

      updated++
    }

    return NextResponse.json({
      ok: true,
      updated,
      wallets: Object.keys(map).length
    })

  } catch (error) {
    console.error("FIX ERROR:", error)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}