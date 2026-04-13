import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rateLimit } from "@/lib/security/rateLimit"

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
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      )
    }

    const user_email = email.toLowerCase()

    /* =========================
       🔐 RATE LIMIT OTP
    ========================= */
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      ""

    const rl = await rateLimit(user_email, "otp", ip)

    if (rl.blocked) {
      return NextResponse.json({ error: rl.reason }, { status: 429 })
    }

    const code = generateCode()

    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + 5)

    /* =========================
       INVALIDAR OTP ANTERIORES
    ========================= */
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("user_email", user_email)
      .eq("used", false)

    /* =========================
       CREAR NUEVO OTP
    ========================= */
    const { error } = await supabase.from("otp_codes").insert({
      user_email,
      code,
      expires_at: expires,
      verified: false,
      used: false
    })

    if (error) {
      console.error("❌ Error OTP:", error)

      return NextResponse.json(
        { error: "Error generando código" },
        { status: 500 }
      )
    }

    console.log("🔐 OTP:", code)

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("❌ ERROR OTP:", err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}