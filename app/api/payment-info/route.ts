import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const payment_id = searchParams.get("payment_id")

  if (!payment_id) {
    return NextResponse.json({ error: "No payment_id" }, { status: 400 })
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("payment_id", payment_id)

  const { data: ledger } = await supabase
    .from("financial_ledger")
    .select("*")
    .eq("payment_id", payment_id)
    .maybeSingle()

  let campaign = null

  if (ledger?.campaign_id) {
    const { data } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", ledger.campaign_id)
      .maybeSingle()

    campaign = data
  }

  return NextResponse.json({
    tickets,
    amount: ledger?.amount || 0,
    campaign
  })
}
