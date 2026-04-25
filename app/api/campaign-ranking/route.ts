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
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from("campaign_donor_ranking")
      .select("*")
      .eq("campaign_id", campaign_id)
      .order("total_donated", { ascending: false })
      .limit(10)

    if (error) {
      console.error(error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])

  } catch (err) {
    console.error(err)
    return NextResponse.json([])
  }
}