import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { securityGuard } from "@/lib/security/guard"
import { rateLimit } from "@/lib/security/rateLimit"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { amount, otp } = await req.json()

    const email = req.headers.get("x-user-email")

    if (!email || !amount || amount <= 0 || !otp) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const userAgent = req.headers.get("user-agent") || "unknown"

    // 🚫 RATE LIMIT
    const limit = await rateLimit(email, "withdraw")

    if (limit.blocked) {
      return NextResponse.json({ error: limit.reason }, { status: 429 })
    }

    // 🚨 ANTIFRAUDE
    const fraud = await securityGuard(email)

    if (fraud.isDanger) {
      return NextResponse.json(
        { error: "Cuenta bloqueada por actividad sospechosa" },
        { status: 403 }
      )
    }

    // 💾 LOG DISPOSITIVO
    await supabase.from("user_devices").insert({
      user_email: email,
      ip,
      user_agent: userAgent,
    })

    // 🔒 LOCK
    await supabase.rpc("advisory_lock", {
      lock_key: email,
    })

    // 💸 RETIRO
    const { data, error } = await supabase.rpc("request_withdraw", {
      p_user_email: email,
      p_amount: amount,
      p_otp_code: otp,
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)
      return NextResponse.json(
        { error: "Error procesando retiro" },
        { status: 500 }
      )
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
