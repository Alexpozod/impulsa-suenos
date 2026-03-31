export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data: ledger, error } = await supabase
    .from("financial_ledger")
    .select("amount, type")
    .eq("campaign_id", campaign_id)
    .eq("status", "confirmed")

  if (error) {
    return {
      balance: 0,
      totalIn: 0,
      totalOut: 0
    }
  }

  const totalIn =
    ledger
      ?.filter((l: any) => l.type === "payment")
      .reduce((acc: number, l: any) => acc + Number(l.amount), 0) || 0

  const totalOut =
    ledger
      ?.filter(
        (l: any) =>
          l.type === "refund" ||
          l.type === "fee" ||
          l.type === "withdraw"
      )
      .reduce((acc: number, l: any) => acc + Number(l.amount), 0) || 0

  return {
    balance: totalIn - totalOut,
    totalIn,
    totalOut
  }
}
