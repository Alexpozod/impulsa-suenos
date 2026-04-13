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
      .order("created_at", { ascending: false })

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount") 
          .eq("campaign_id", c.id)
          .eq("type", "payment")
          .eq("status", "confirmed")

        const totalRaised =
          ledger?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

        return {
          ...c,
          total_raised: totalRaised,
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}