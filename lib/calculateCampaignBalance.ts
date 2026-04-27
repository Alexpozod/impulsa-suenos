export async function calculateCampaignBalance(
  supabase: any,
  campaign_id: string
) {

  /* =========================
     📥 LEDGER DE LA CAMPAÑA
  ========================= */
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

  for (const row of data) {
    const amount = Number(row.amount || 0)

    // 💰 dinero real del creador
    if (row.type === "creator_net") {
      balance += amount
      totalIn += amount
    }

    // 💸 retiros aprobados
    if (row.type === "withdraw") {
      balance -= Math.abs(amount)
      totalOut += Math.abs(amount)
    }
  }

  /* =========================
     🔥 PENDING GLOBAL (FIX REAL)
  ========================= */

  // 1. Obtener dueño de la campaña
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("user_email")
    .eq("id", campaign_id)
    .single()

  let totalPending = 0

  if (campaign?.user_email) {

    // 2. Buscar TODOS los retiros pendientes del usuario
    const { data: pendingRows } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("user_email", campaign.user_email)
      .eq("type", "withdraw_pending")
      .eq("status", "confirmed")

    for (const row of pendingRows || []) {
      totalPending += Math.abs(Number(row.amount || 0))
    }
  }

  /* =========================
     💰 DISPONIBLE REAL
  ========================= */
  const available = balance - totalPending

  return {
    available,
    balance,
    totalIn,
    totalOut,
    pending: totalPending
  }
}