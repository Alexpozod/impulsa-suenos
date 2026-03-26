import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, amount, otp } = await req.json()

    // 🚨 Validación fuerte
    if (!email || !amount || amount <= 0 || !otp) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // 🔥 LLAMADA RPC SEGURA (CON OTP)
    const { data, error } = await supabase.rpc("request_withdraw", {
      p_user_email: email,
      p_amount: amount,
      p_otp_code: otp
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

      return NextResponse.json(
        { error: "Error procesando retiro" },
        { status: 500 }
      )
    }

    // ⚠️ ERRORES CONTROLADOS DESDE SQL
    if (data?.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      )
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
