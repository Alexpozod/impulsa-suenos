import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth/requireAdmin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📥 GET CONFIG REAL
========================= */
export async function GET(req: Request) {
  try {

    await requireAdmin(req)

    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data || {})

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "error" },
      { status: 500 }
    )
  }
}

/* =========================
   💾 GUARDAR CONFIG
========================= */
export async function POST(req: Request) {
  try {

    await requireAdmin(req)

    const body = await req.json()

    const fee_fixed = Number(body.fee_fixed)
    const fee_percent = Number(body.fee_percent)
    const iva = Number(body.iva)

    if (
      isNaN(fee_fixed) ||
      isNaN(fee_percent) ||
      isNaN(iva)
    ) {
      return NextResponse.json(
        { error: "invalid_values" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("platform_settings")
      .insert({
        fee_fixed,
        fee_percent,
        iva
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      config: data
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "error" },
      { status: 500 }
    )
  }
}