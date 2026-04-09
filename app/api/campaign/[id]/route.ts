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
    const id = parts[parts.length - 1]?.trim()

    if (!id) {
      return NextResponse.json(null, { status: 400 })
    }

    // 📌 CAMPAÑA
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error || !campaign) {
      return NextResponse.json(null, { status: 200 })
    }

    // 💰 DINERO REAL (solo DONACIONES)
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", id)
      .eq("type", "payment")
      .eq("status", "confirmed")

    const current_amount =
      ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

    // 🆕 ÚLTIMAS DONACIONES
    const { data: donations } = await supabase
      .from("financial_ledger")
      .select("amount, user_email, created_at")
      .eq("campaign_id", id)
      .eq("type", "payment")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      ...campaign,
      current_amount,
      goal_amount: Number(campaign.goal_amount || 0),
      donations: donations || []
    })

  } catch (err) {
    console.error("CAMPAIGN DETAIL ERROR:", err)
    return NextResponse.json(null, { status: 200 })
  }
}