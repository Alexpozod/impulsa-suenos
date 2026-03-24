import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { email, amount } = await req.json()

  // 💰 verificar saldo
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_email", email)
    .single()

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json(
      { error: "Saldo insuficiente" },
      { status: 400 }
    )
  }

  // 📤 crear solicitud
  await supabase.from("withdrawals").insert({
    user_email: email,
    amount,
    status: "pending"
  })

  return NextResponse.json({ ok: true })
}
