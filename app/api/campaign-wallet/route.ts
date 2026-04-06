import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       🔓 LIBERACIÓN AUTOMÁTICA (SAFE)
       ========================= */
    const cutoff = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    await supabase
      .from("financial_ledger")
      .update({ status: "confirmed" })
      .eq("flow_type", "in")
      .eq("status", "pending")
      .eq("campaign_id", campaign_id)
      .lte("created_at", cutoff)

    /* =========================
       💰 CALCULAR BALANCE REAL
       ========================= */
    const wallet = await calculateCampaignBalance(
      supabase,
      campaign_id
    )

    return NextResponse.json({
      balance: wallet.available,
      pending: wallet.pending,
      totalIn: wallet.totalIn,
      totalOut: wallet.totalOut
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}