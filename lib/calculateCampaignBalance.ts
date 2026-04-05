export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data, error } = await supabase
    .from("financial_ledger")
    .select("amount, flow_type")
    .eq("campaign_id", campaign_id)

  if (error || !data) {
    return {
      balance: 0,
      totalIn: 0,
      totalOut: 0,
    }
  }

  let totalIn = 0
  let totalOut = 0

  for (const row of data) {
    const amount = Number(row.amount || 0)

    if (row.flow_type === "in") {
      totalIn += amount
    } else if (row.flow_type === "out") {
      totalOut += Math.abs(amount)
    }
  }

  const balance = totalIn - totalOut

  return {
    balance,
    totalIn,
    totalOut,
  }
}