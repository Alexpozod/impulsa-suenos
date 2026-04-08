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

  // 🔥 TRAER TODO EL LEDGER
  const { data: ledgerRows } = await supabase
    .from("financial_ledger")
    .select("*")
    .eq("payment_id", payment_id)

  console.log("📊 LEDGER:", ledgerRows)

  // 🔥 BUSCAR SOLO EL PAYMENT REAL
  const paymentRow = ledgerRows?.find(l => l.type === "payment")

  if (!paymentRow) {
    return NextResponse.json({
      amount: 0,
      campaign: null
    })
  }

  const amount = Number(paymentRow.amount || 0)
  const campaign_id = paymentRow.campaign_id

  let campaign = null

  if (campaign_id) {
    const { data } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    campaign = data
  }

  return NextResponse.json({
    amount,
    campaign
  })
}