import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      )
    }

    console.log("🔍 Buscando tickets para:", email)

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        ticket_number,
        created_at,
        campaigns (
          id,
          title
        )
      `)
      .eq("user_email", email)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error DB:", error)
      return NextResponse.json(
        { error: "Error en base de datos" },
        { status: 500 }
      )
    }

    console.log("🎟️ Tickets encontrados:", data?.length || 0)

    return NextResponse.json({
      tickets: data || []
    })

  } catch (error) {
    console.error("❌ Error servidor:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
