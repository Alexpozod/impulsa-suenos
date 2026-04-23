import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📊 CAMPAÑAS (PÚBLICO)
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select(`
        id,
        title,
        goal_amount,
        image_url,
        status
      `)
      .eq("status", "active")

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const wallet = await calculateCampaignBalance(supabase, c.id)

        return {
          ...c,
          raised: wallet.totalIn,
          balance: wallet.available
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 })
  }
}