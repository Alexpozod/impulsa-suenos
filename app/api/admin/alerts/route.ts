import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .like("action", "alert.%")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json([], { status: 500 })
    }

    return NextResponse.json(data)

  } catch (e) {
    return NextResponse.json([], { status: 500 })
  }
}
