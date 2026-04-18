import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function syncWallet(user_email: string) {
  try {

    const { data } = await supabase
      .from("financial_ledger")
      .select("amount, flow_type, type")
      .eq("user_email", user_email)
      .eq("status", "confirmed")

    if (!data) return

    let balance = 0

    for (const row of data) {

      if (row.type === "withdraw_pending") continue

      const amount = Number(row.amount || 0)

      if (row.flow_type === "in") balance += amount
      if (row.flow_type === "out") balance -= Math.abs(amount)
    }

    await supabase
      .from("wallets")
      .upsert({
        user_email,
        available_balance: balance,
        pending_balance: 0,
        updated_at: new Date().toISOString()
      })

  } catch (error) {
    console.error("syncWallet error", error)
  }
}