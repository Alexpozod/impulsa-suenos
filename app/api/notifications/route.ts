import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📥 OBTENER NOTIFICACIONES
========================= */
export async function GET(req: Request) {
  try {

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/* =========================
   🔘 MARCAR COMO LEÍDO
========================= */
export async function POST(req: Request) {
  try {

    const body = await req.json()
    const id = body?.id

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 })
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}