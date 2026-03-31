import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { campaign_id, amount } = await req.json()

    if (!campaign_id || !amount) {
      return NextResponse.json(
        { error: "datos incompletos" },
        { status: 400 }
      )
    }

    // 🔒 FIX CRÍTICO
    const wallet = await calculateCampaignBalance(
      supabase,
      campaign_id
    )

    if (Number(amount) > wallet.balance) {
      return NextResponse.json(
        { error: "saldo insuficiente" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("payouts")
      .insert({
        campaign_id,
        amount,
        status: "pending"
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "error payout" },
      { status: 500 }
    )
  }
}
