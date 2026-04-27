export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data, error } = await supabase
    .from("financial_ledger")
    .select("amount, type")
    .eq("campaign_id", campaign_id)
    .eq("status", "confirmed")

  if (error || !data) {
    return {
      available: 0,
      balance: 0,
      totalIn: 0,
      totalOut: 0,
      pending: 0
    }
  }

  let balance = 0
  let totalIn = 0
  let totalOut = 0
  let pending = 0

  for (const row of data) {
    const amount = Number(row.amount || 0)

    /* =========================
       💰 DINERO REAL USUARIO
    ========================= */
    if (row.type === "creator_net") {
      balance += amount
      totalIn += amount
    }

    /* =========================
       💸 RETIROS APROBADOS
    ========================= */
    if (row.type === "withdraw") {
      balance -= Math.abs(amount)
      totalOut += Math.abs(amount)
    }

    /* =========================
       🟡 RETIROS PENDIENTES
    ========================= */
    if (row.type === "withdraw_pending") {
      pending += Math.abs(amount)
    }
  }

  const available = balance - pending

  return {
    available,
    balance,
    totalIn,
    totalOut,
    pending
  }
}