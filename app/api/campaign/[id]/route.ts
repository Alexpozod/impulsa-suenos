import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const parts = url.pathname.split("/")

    const rawId = parts[parts.length - 1]
    const id = rawId?.trim()

    if (!id) {
      return NextResponse.json(null, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .ilike("id", id)

    if (error || !campaign || campaign.length === 0) {
      return NextResponse.json(null, { status: 200 })
    }

    const campaignData = campaign[0]

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", id)
      .eq("flow_type", "in")
      .eq("status", "confirmed")

    const current_amount =
      ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

    return NextResponse.json({
      ...campaignData,
      current_amount,
      goal_amount: Number(campaignData.goal_amount || 0)
    })

  } catch (err) {
    console.error("CAMPAIGN DETAIL ERROR:", err)
    return NextResponse.json(null, { status: 200 })
  }
}