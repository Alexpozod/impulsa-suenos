import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs" // 🔥 importante para evitar edge issues

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function GET() {
  try {

    const { data, error } = await supabase
      .from("system_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({
      logs: data || []
    })

  } catch (err) {

    console.error("❌ system-events error:", err)

    return NextResponse.json(
      { error: "failed_to_fetch_system_events" },
      { status: 500 }
    )
  }
}