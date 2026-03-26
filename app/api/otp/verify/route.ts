import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    const { data } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("user_email", email)
      .eq("code", code)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) {
      return NextResponse.json({ error: "Código inválido" })
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "Código expirado" })
    }

    // marcar como usado
    await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", data.id)

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
