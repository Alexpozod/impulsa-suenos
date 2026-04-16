import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url)
    const payment_id = searchParams.get("payment_id")

    if (!payment_id) {
      return NextResponse.json(
        { error: "missing payment_id" },
        { status: 400 }
      )
    }

    /* =========================
       💰 BUSCAR DONACIÓN
    ========================= */
    const { data: payment, error } = await supabase
      .from("financial_ledger")
      .select("amount, campaign_id")
      .eq("payment_id", payment_id)
      .eq("type", "payment")
      .maybeSingle()

    if (error) {
      console.error("payment-info DB error:", error)
      return NextResponse.json({ amount: 0 })
    }

    if (!payment) {
      return NextResponse.json({ amount: 0 })
    }

    /* =========================
       📦 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", payment.campaign_id)
      .maybeSingle()

    return NextResponse.json({
      amount: Number(payment.amount || 0),
      campaign: campaign || null
    })

  } catch (err) {
    console.error("payment-info error:", err)
    return NextResponse.json({ amount: 0 })
  }
}