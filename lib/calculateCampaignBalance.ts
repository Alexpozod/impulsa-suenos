export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data, error } = await supabase
    .from("financial_ledger")
    .select("amount, flow_type, status")
    .eq("campaign_id", campaign_id)

  if (error || !data) {
    return {
      available: 0,
      pending: 0,
      totalIn: 0,
      totalOut: 0,
    }
  }

  let available = 0
  let pending = 0
  let totalIn = 0
  let totalOut = 0

  for (const row of data) {

    const amount = Number(row.amount || 0)

    // 💰 ENTRADAS
    if (row.flow_type === "in") {

      totalIn += amount

      if (row.status === "confirmed") {
        available += amount
      }

      if (row.status === "pending") {
        pending += amount
      }
    }

    // 💸 SALIDAS
    if (row.flow_type === "out") {

      totalOut += Math.abs(amount)

      // siempre descuentan del disponible
      available -= Math.abs(amount)
    }
  }

  return {
    available,
    pending,
    totalIn,
    totalOut,
  }
}