import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    // 🎟️ obtener todos los tickets
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("campaign_id", campaign_id)

    if (error || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "No hay tickets" },
        { status: 400 }
      )
    }

    // 🎯 seleccionar ganador aleatorio
    const randomIndex = Math.floor(Math.random() * tickets.length)
    const winner = tickets[randomIndex]

    // 💾 guardar ganador
    await supabase.from("winners").insert({
      campaign_id,
      ticket_number: winner.ticket_number,
      user_email: winner.user_email,
    })

    return NextResponse.json({
      winner,
    })

  } catch (error) {
    console.error("❌ ERROR DRAW:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
