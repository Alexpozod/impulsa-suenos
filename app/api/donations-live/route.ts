import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    /* =========================
       🔐 FIX SEGURIDAD (CRÍTICO)
    ========================= */
    if (!campaign_id) {
      return NextResponse.json([], { status: 200 })
    }

    let query = supabase
      .from("financial_ledger")
      .select(`
        id,
        amount,
        created_at,
        campaign_id,
        user_email,
        metadata,
        payment_id
      `)
      .eq("type", "payment")
      .eq("status", "confirmed")
      .eq("campaign_id", campaign_id) // 🔥 FORZADO
      .order("created_at", { ascending: false })
      .limit(10)

    const { data, error } = await query

    if (error) {
      console.error("Donations fetch error:", error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json([], { status: 200 })
  }
}