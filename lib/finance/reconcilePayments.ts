import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function reconcileCampaign(campaign_id: string) {
  try {

    // 💰 TOTAL EN LEDGER (DEPÓSITOS)
    const { data: deposits } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", campaign_id)
      .eq("type", "deposit")

    const totalDeposits =
      deposits?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

    // 💸 TOTAL RETIROS
    const { data: withdrawals } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", campaign_id)
      .eq("type", "withdraw")

    const totalWithdrawals =
      withdrawals?.reduce((acc, w) => acc + Number(w.amount), 0) || 0

    const balance = totalDeposits - totalWithdrawals

    return {
      ok: true,
      totalDeposits,
      totalWithdrawals,
      balance,
    }

  } catch (error) {
    return {
      ok: false,
      error,
    }
  }
}