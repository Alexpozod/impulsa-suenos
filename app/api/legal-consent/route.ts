import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { type, accepted, version, email } = body

    const userAgent = req.headers.get("user-agent")
    const ip =
      req.headers.get("x-forwarded-for") ||
      "unknown"

    const { error } = await supabase
      .from("legal_consents")
      .insert({
        type,
        accepted,
        version,
        email,
        user_agent: userAgent,
        ip
      })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "db error" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}