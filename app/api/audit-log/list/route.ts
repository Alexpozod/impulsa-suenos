import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json(
      { error: "failed_to_fetch_logs" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    logs: data
  })
}
