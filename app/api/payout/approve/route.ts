import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { payout_id } = await req.json()

    // 1. obtener payout
    const { data: payout } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .single()

    if (!payout) {
      return NextResponse.json({ error: "no payout" }, { status: 404 })
    }

    // 2. marcar como pagado
    await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    // 3. registrar en ledger (SALIDA REAL)
    await supabase.from("financial_ledger").insert({
      campaign_id: payout.campaign_id,
      amount: payout.amount,
      type: "withdraw",
      status: "confirmed"
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json(
      { error: "error approve" },
      { status: 500 }
    )
  }
}
