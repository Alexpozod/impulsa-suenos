import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Error cargando campañas" },
        { status: 500 }
      )
    }

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount")
          .eq("campaign_id", c.id)
          .eq("type", "payment")
          .eq("status", "confirmed")

        const total = ledger?.reduce(
          (acc, d) => acc + Number(d.amount),
          0
        ) || 0

        const { count: ticketsSold } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", c.id)

        return {
          ...c,
          raised: total,
          ticketsSold: ticketsSold || 0
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
