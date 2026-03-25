import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📥 obtener retiros
export async function GET() {
  const { data } = await supabase
    .from("withdrawals")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json(data)
}

// ✅ aprobar / ❌ rechazar
export async function POST(req: Request) {
  try {
    const { id, action, user_email, amount } = await req.json()

    if (action === "approve") {
      // solo cambiar estado
      await supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", id)

      return NextResponse.json({ ok: true })
    }

    if (action === "reject") {
      // devolver dinero
      await supabase.rpc("add_balance", {
        user_email_input: user_email,
        amount_input: amount
      })

      await supabase
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", id)

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Acción inválida" })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
