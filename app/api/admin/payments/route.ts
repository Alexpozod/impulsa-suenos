import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       🔥 BUSQUEDA INTELIGENTE
    ========================= */
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .or(`id.eq.${id},external_id.eq.${id},mp_payment_id.eq.${id}`)
      .limit(1)
      .maybeSingle()

    if (!data) {
      return NextResponse.json(
        { error: "payment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (err) {

    console.error("❌ payment detail error", err)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}