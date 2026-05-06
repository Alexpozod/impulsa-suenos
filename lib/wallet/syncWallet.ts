import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function syncWallet(user_email: string) {

  try {

    if (!user_email) return

    /* =========================
       📥 CAMPAÑAS DEL USUARIO
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id")
      .eq("user_email", user_email)

    const campaignIds = (campaigns || []).map(c => c.id)

    if (campaignIds.length === 0) return

    /* =========================
       📥 LEDGER REAL
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("type, amount")
      .in("campaign_id", campaignIds)
      .eq("status", "confirmed")

    if (!ledger) return

    let balance = 0
    let totalEarned = 0

    for (const row of ledger) {

      const amount = Number(row.amount || 0)

      switch (row.type) {

        case "creator_net":
          balance += amount
          totalEarned += amount
          break

        case "withdraw":
        case "withdraw_pending":
          balance -= Math.abs(amount)
          break

        default:
          break
      }
    }

    /* =========================
       💾 UPSERT WALLET
    ========================= */
    await supabase
      .from("wallets")
      .upsert({
        user_email,
        balance,
        available_balance: balance,
        pending_balance: 0,
        total_earned: totalEarned,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_email"
      })

  } catch (error) {
    console.error("syncWallet error", error)
  }
}