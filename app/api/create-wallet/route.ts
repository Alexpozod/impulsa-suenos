import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { email } = await req.json()

  const { data: existing } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_email", email)
    .maybeSingle()

  if (!existing) {
    await supabase.from("wallets").insert({
      user_email: email,
      balance: 0
    })
  }

  return NextResponse.json({ ok: true })
}
