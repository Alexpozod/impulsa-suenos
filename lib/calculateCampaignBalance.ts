import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function calculateCampaignBalance(campaign_id: string) {

  const { data: ledger } = await supabase
    .from("financial_ledger")
    .select("amount, type")
    .eq("campaign_id", campaign_id)
    .eq("status", "confirmed")

  const totalIn = ledger
    ?.filter(l => l.type === "payment")
    .reduce((a, b) => a + Number(b.amount), 0) || 0

  const totalOut = ledger
    ?.filter(l => l.type === "refund" || l.type === "fee")
    .reduce((a, b) => a + Number(b.amount), 0) || 0

  return {
    balance: totalIn - totalOut,
    totalIn,
    totalOut
  }
}
