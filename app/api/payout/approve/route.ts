import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { payout_id } = await req.json()

    const { data, error } = await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "error approve" },
      { status: 500 }
    )
  }
}
