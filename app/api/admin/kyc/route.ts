import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAIL = "contacto@impulsasuenos.com"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { user_email, status, admin_email } = body

    // 🔒 VALIDAR ADMIN
    if (admin_email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!user_email || !status) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // 🛡️ UPDATE KYC
    const { error } = await supabase
      .from("kyc")
      .update({ status })
      .eq("user_email", user_email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 })
  }
}
