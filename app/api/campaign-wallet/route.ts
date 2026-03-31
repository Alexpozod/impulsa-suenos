import { NextResponse } from "next/server"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

export async function POST(req: Request) {
  try {
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    const wallet = await calculateCampaignBalance(campaign_id)

    return NextResponse.json(wallet)

  } catch (error) {
    return NextResponse.json(
      { error: "Error wallet" },
      { status: 500 }
    )
  }
}
