// ⚠️ ADMIN ONLY (PROTEGIDO POR FRONTEND)

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data, error } = await supabase
      .from("financial_ledger")
      .select(`
        *,
        campaigns (
          title
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("ledger error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error("ledger crash:", error)

    // 🔥 NUNCA ROMPER FRONTEND
    return NextResponse.json([])
  }
}