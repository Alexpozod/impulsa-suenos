import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount")
          .eq("campaign_id", c.id)
          .eq("flow_type", "in")
          .eq("status", "confirmed")

        const current_amount =
          ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

        const progress = c.goal_amount > 0
          ? Math.min((current_amount / Number(c.goal_amount)) * 100, 100)
          : 0

        return {
          ...c,
          current_amount,
          progress
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    console.error(error)
    return NextResponse.json([], { status: 200 })
  }
}