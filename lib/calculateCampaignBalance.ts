export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {
  const { data, error } = await supabase
    .from("financial_ledger")
    .select("amount, flow_type, type")
    .eq("campaign_id", campaign_id)
    .eq("status", "confirmed") // 🔥 IMPORTANTE

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

    // 💰 TODO LO QUE ENTRA
    if (row.flow_type === "in") {
      totalIn += amount
      balance += amount
    }

    // 💸 SOLO RETIRO REAL (APROBADO)
    if (row.flow_type === "out" && row.type === "withdraw") {
      totalOut += Math.abs(amount)
      balance -= Math.abs(amount)
    }

    // 🟡 RETIRO PENDIENTE (NO DESCARTA AQUÍ)
    if (row.flow_type === "out" && row.type === "withdraw_pending") {
      pending += Math.abs(amount)
    }
  }

  // 🔥 CLAVE: available real
  const available = balance - pending

  return {
    available,
    balance, // 👈 dinero real sin bloquear
    totalIn,
    totalOut,
    pending
  }
}