import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
        { error: "Missing campaign_id" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("financial_ledger")
      .select("amount, created_at, metadata")
      .eq("campaign_id", campaign_id)
      .eq("type", "payment")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Donations fetch error:", error)
      return NextResponse.json(
        { error: "Error fetching donations" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}