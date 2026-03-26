import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const code = generateCode()

    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + 5)

    // guardar código
    await supabase.from("otp_codes").insert({
      user_email: email,
      code,
      expires_at: expires
    })

    // ⚠️ SIMULACIÓN SMS (luego puedes conectar Twilio)
    console.log("📲 OTP:", code)

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
