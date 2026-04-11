import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic" // evita cache en Next

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data, error } = await supabase
      .from("system_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("❌ error fetching events:", error)

      return NextResponse.json(
        { error: "error fetching events" },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (err) {

    console.error("❌ route crash:", err)

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}