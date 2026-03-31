import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const severity = searchParams.get("severity")
    const status = searchParams.get("status")

    let query = supabase
      .from("fraud_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (severity) {
      query = query.eq("severity", severity)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: "error fetching alerts" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}
