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
       🔐 SEGURIDAD
    ========================= */
    if (!campaign_id) {
      return NextResponse.json([], { status: 200 })
    }

    const { data, error } = await supabase
      .from("financial_ledger")
      .select(`
        id,
        amount,
        created_at,
        campaign_id,
        metadata,
        payment_id
      `) // ❌ user_email eliminado
      .eq("type", "payment")
      .eq("status", "confirmed")
      .eq("campaign_id", campaign_id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Donations fetch error:", error)
      return NextResponse.json([], { status: 200 })
    }

    /* =========================
       🧠 ANONIMIZAR
    ========================= */
    const safe = (data || []).map((d) => ({
      id: d.id,
      amount: d.amount,
      created_at: d.created_at,
      campaign_id: d.campaign_id,
      message: d.metadata?.message || "",
      payment_id: d.payment_id
    }))

    return NextResponse.json(safe)

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json([], { status: 200 })
  }
}