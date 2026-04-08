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

  // 🔥 1. BUSCAR EN LEDGER (SIN maybeSingle)
  const { data: ledgerRows } = await supabase
    .from("financial_ledger")
    .select("*")
    .eq("payment_id", payment_id)
    .order("created_at", { ascending: false })

const ledger = ledgerRows?.find(l => l.type === "payment") || null

  // 🔥 2. SI NO EXISTE, fallback por metadata (CRÍTICO)
  let amount = ledger?.amount || 0
  let campaign_id = ledger?.campaign_id || null

  // 🔥 3. CAMPAÑA
  let campaign = null

  if (campaign_id) {
    const { data } = await supabase
      .from("campaigns")
      .select("title")
      .eq("id", campaign_id)
      .maybeSingle()

    campaign = data
  }

  // 🔥 4. TICKETS
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("payment_id", payment_id)

  return NextResponse.json({
    tickets: tickets || [],
    amount,
    campaign
  })
}