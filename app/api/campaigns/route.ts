import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔥 CAMPAÑAS ACTIVAS
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

    // 🔥 DONACIONES (para progreso)
    const { data: donations } = await supabase
      .from("donations")
      .select("amount, campaign_id")

    const enriched = campaigns.map((c: any) => {

      const total = donations
        ?.filter((d: any) => d.campaign_id === c.id)
        .reduce((acc: number, d: any) => acc + Number(d.amount), 0) || 0

      return {
        ...c,
        raised: total
      }
    })

    return NextResponse.json(enriched)

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
