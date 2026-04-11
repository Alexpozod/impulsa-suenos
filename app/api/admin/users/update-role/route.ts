import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { user_id, role } = await req.json()

    if (!user_id || !role) {
      return NextResponse.json(
        { error: "faltan datos" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user_id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json(
      { error: "error servidor" },
      { status: 500 }
    )
  }
}