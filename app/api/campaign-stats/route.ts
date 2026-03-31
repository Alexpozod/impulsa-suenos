import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      )
    }

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount")
      .eq("campaign_id", campaign_id)
      .eq("type", "payment")
      .eq("status", "confirmed")

    const totalRaised =
      ledger?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

    const { count: ticketsSold } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaign_id)

    const progress = Math.min(
      Math.round((totalRaised / campaign.goal_amount) * 100),
      100
    )

    return NextResponse.json({
      title: campaign.title,
      goal: campaign.goal_amount,
      raised: totalRaised,
      progress,
      ticketsSold: ticketsSold || 0,
      totalTickets: campaign.total_tickets,
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
