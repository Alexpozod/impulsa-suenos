import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select("user_email, amount, status")

    if (error) {
      console.error("Ledger error:", error)
      return NextResponse.json(
        { error: "ledger_error" },
        { status: 500 }
      )
    }

    const map: Record<string, { user_email: string; balance: number }> = {}

    ledger?.forEach((l: any) => {

      if (!l.user_email) return
      if (l.status !== "confirmed") return

      if (!map[l.user_email]) {
        map[l.user_email] = {
          user_email: l.user_email,
          balance: 0
        }
      }

      // 🔥 IMPORTANTE: amount ya viene con signo correcto
      map[l.user_email].balance += Number(l.amount || 0)

    })

    const wallets = Object.values(map).sort(
      (a, b) => b.balance - a.balance
    )

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