import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Error cargando campañas" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
