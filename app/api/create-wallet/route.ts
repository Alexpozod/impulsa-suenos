import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  /* =========================
     🔐 AUTH (AQUÍ VA)
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

  const user_email = user.email.toLowerCase()

  /* =========================
     👛 WALLET CHECK
  ========================= */
  const { data: existing } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_email", user_email)
    .maybeSingle()

  if (!existing) {
    await supabase.from("wallets").insert({
      user_email: user_email,
      balance: 0
    })
  }

  return NextResponse.json({ ok: true })
}