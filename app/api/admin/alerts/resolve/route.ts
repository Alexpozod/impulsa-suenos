import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "id requerido" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("fraud_alerts")
      .update({ status: "resolved" })
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: "error updating alert" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}
