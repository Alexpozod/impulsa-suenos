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
       📥 LEDGER REAL
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        type,
        amount,
        user_email,
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

    if (!ledger || ledger.length === 0) {
      return NextResponse.json({
        wallets: [],
        total: 0
      })
    }

    /* =========================
       🧠 MAPA DE BALANCES
    ========================= */
    const map: Record<string, number> = {}

    const add = (email: string, value: number) => {
      if (!map[email]) map[email] = 0
      map[email] += value
    }

    /* =========================
       🔥 MISMA LÓGICA QUE FINANCE
    ========================= */
    for (const row of ledger) {

      const campaignUser =
        Array.isArray(row.campaigns) && row.campaigns.length > 0
          ? row.campaigns[0]?.user_email
          : null

      const userEmail =
        campaignUser ||
        row.user_email ||
        "platform"

      const amount = Number(row.amount || 0)

      switch (row.type) {

        case "payment":
          add(userEmail, amount)
          break

        case "creator_net":
          add(userEmail, amount)
          break

        case "withdraw":
          add(userEmail, -Math.abs(amount))
          break

        case "withdraw_pending":
          add(userEmail, -Math.abs(amount))
          break

        case "fee_platform":
        case "fee_platform_iva":
        case "fee_mp":
        case "tip":
          add("platform", Math.abs(amount))
          break

        default:
          // no hacer nada
          break
      }
    }

    /* =========================
       📊 FORMATO FINAL
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