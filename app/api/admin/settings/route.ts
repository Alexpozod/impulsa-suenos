import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📥 OBTENER CONFIG
export async function GET() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "commission_rate")
    .single()

  if (error) {
    return NextResponse.json({ error: "Error cargando config" }, { status: 500 })
  }

  return NextResponse.json(data)
}

// 💾 ACTUALIZAR COMISIÓN
export async function POST(req: Request) {
  try {
    const { value } = await req.json()

    if (!value) {
      return NextResponse.json(
        { error: "Valor requerido" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("settings")
      .update({ value })
      .eq("key", "commission_rate")

    if (error) {
      return NextResponse.json(
        { error: "Error actualizando" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
