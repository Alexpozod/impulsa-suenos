import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const { id } = params

    if (!id) {
      return NextResponse.json(null, { status: 400 })
    }

    /* =========================
       📊 CAMPAÑA
    ========================= */
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !campaign) {
      return NextResponse.json(null, { status: 200 })
    }

    /* =========================
       💰 DINERO REAL
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", id)
      .eq("flow_type", "in")
      .eq("status", "confirmed")

    const current_amount =
      ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

    return NextResponse.json({
      ...campaign,
      current_amount
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json(null, { status: 200 })
  }
}