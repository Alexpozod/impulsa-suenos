import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    // ✅ FIX PRINCIPAL AQUÍ
    const wallet = await calculateCampaignBalance(
      supabase,
      campaign_id
    )

    return NextResponse.json(wallet)
  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
