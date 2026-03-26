import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json()

    const { error } = await supabase
      .from("user_risk")
      .update({ status })
      .eq("user_id", userId)

    if (error) {
      return NextResponse.json(
        { error: "Error actualizando usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
