import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: users, error } = await supabase
      .from("wallets")
      .select("user_email")

    if (error) {
      return NextResponse.json({ error: "db error" }, { status: 500 })
    }

    if (!users) {
      return NextResponse.json({ error: "no users" }, { status: 400 })
    }

    let updated = 0

    for (const u of users) {

      const email = u.user_email

      const { data: ledger } = await supabase
        .from("financial_ledger")
        .select("amount, flow_type, type")
        .eq("user_email", email)
        .eq("status", "confirmed")

      if (!ledger) continue

      let balance = 0

      for (const row of ledger) {

        if (row.type === "withdraw_pending") continue

        const amount = Number(row.amount || 0)

        if (row.flow_type === "in") {
          balance += amount
        }

        if (row.flow_type === "out") {
          balance -= Math.abs(amount)
        }
      }

      await supabase
        .from("wallets")
        .update({
          available_balance: balance,
          pending_balance: 0,
          updated_at: new Date().toISOString()
        })
        .eq("user_email", email)

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