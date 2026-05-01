import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 })
    }

    /* =========================
       🔐 AUTH (USAR TOKEN)
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const email = user.email.toLowerCase()

    /* =========================
       🔎 BUSCAR OTP
    ========================= */
    const { data: otp } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("user_email", email)
      .eq("code", code)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!otp) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    /* =========================
       ⏳ EXPIRACIÓN
    ========================= */
    if (new Date(otp.expires_at) < new Date()) {
      return NextResponse.json({ error: "Código expirado" }, { status: 400 })
    }

    /* =========================
       ✅ MARCAR USADO + VERIFIED
    ========================= */
    await supabase
  .from("otp_codes")
  .update({
    verified: true
  })
  .eq("id", otp.id)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("OTP VERIFY ERROR:", err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}