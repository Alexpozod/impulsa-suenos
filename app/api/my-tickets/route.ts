import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_email", email)

    if (error) {
      console.error("❌ DB error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ tickets: data || [] })

  } catch (err) {
    console.error("❌ API error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
