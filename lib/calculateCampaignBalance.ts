export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data, error } = await supabase
    .from("financial_ledger")
    .select("amount, flow_type, type")
    .eq("campaign_id", campaign_id)

  if (error || !data) {
    return {
      available: 0,
      totalIn: 0,
      totalOut: 0,
      pending: 0
    }
  }

  let available = 0
  let totalIn = 0
  let totalOut = 0
  let pending = 0

  for (const row of data) {
    const amount = Number(row.amount || 0)

    // 💰 TODO LO QUE ENTRA
    if (row.flow_type === "in") {
      totalIn += amount
      available += amount
    }

    // 💸 SOLO RETIROS CUENTAN COMO SALIDA REAL
    if (row.flow_type === "out" && row.type === "withdraw") {
      totalOut += Math.abs(amount)
      available -= Math.abs(amount)
    }

    // 🟡 OPCIONAL (SI QUIERES FUTURO HOLD)
    if (row.flow_type === "out" && row.type === "withdraw_pending") {
      pending += Math.abs(amount)
    }
  }

  return {
    available,
    totalIn,
    totalOut,
    pending
  }
}