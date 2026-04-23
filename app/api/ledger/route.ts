// ⚠️ ADMIN ONLY - PROTEGIDO

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth/requireAdmin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    /* =========================
       🔐 ADMIN CHECK
    ========================= */
    await requireAdmin(req)

    const { data, error } = await supabase
      .from("financial_ledger")
      .select(`
        *,
        campaigns (
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json([], { status: 500 })
    }

    return NextResponse.json(data)

  } catch (error: any) {

    if (error.message === "unauthorized" || error.message === "invalid user") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    return NextResponse.json(
      { error: "error servidor" },
      { status: 500 }
    )
  }
}