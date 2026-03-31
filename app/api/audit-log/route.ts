import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      action,
      entity,
      entity_id,
      metadata,
      actor_id,
      organization_id
    } = body

    const { error } = await supabase.from("audit_logs").insert({
      action,
      entity,
      entity_id,
      metadata,
      actor_id,
      organization_id: organization_id || null,
      created_at: new Date().toISOString()
    })

    if (error) {
      return NextResponse.json(
        { error: "audit_failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (e) {
    return NextResponse.json(
      { error: "audit_error" },
      { status: 500 }
    )
  }
}
