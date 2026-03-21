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

        const { count: ticketsSold } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", c.id)

        const { data: donations } = await supabase
          .from("donations")
          .select("amount")
          .eq("campaign_id", c.id)

        const totalRaised =
          donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

        return {
          ...c,
          tickets_sold: ticketsSold || 0,
          total_raised: totalRaised,
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error" }, { status: 500 })
  }
}
