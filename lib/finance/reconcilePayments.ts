// lib/finance/reconcilePayments.ts

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function reconcileCampaign(campaign_id: string) {
  try {
    const { data, error } = await supabase
      .from("financial_ledger")
      .select("amount, flow_type")
      .eq("campaign_id", campaign_id)
.eq("status", "confirmed")

    if (error || !data) {
      return {
        ok: false,
        balance: 0,
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
      ok: true,
      totalIn,
      totalOut,
      balance,
    }

  } catch (error) {
    return {
      ok: false,
      balance: 0,
    }
  }
}