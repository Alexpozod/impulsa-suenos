import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from("user_risk")
    .select("*")
    .order("score", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Error cargando riesgos" },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
