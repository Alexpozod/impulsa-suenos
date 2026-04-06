import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getOrgId } from "@/lib/org/getOrg"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   ✅ GET PUBLIC (FRONT)
========================= */
export async function GET() {
  try {

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("GET campaigns error:", error)
      return NextResponse.json([], { status: 200 })
    }

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount")
          .eq("campaign_id", c.id)
          .eq("flow_type", "in")
          .eq("status", "confirmed")

        const current_amount =
          ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

        // 🔥 SCORE INTELIGENTE (ranking)
        const progress = c.goal_amount > 0
          ? current_amount / Number(c.goal_amount)
          : 0

        const recencyBoost =
          (Date.now() - new Date(c.created_at).getTime()) < 1000 * 60 * 60 * 24 * 3
            ? 1.2
            : 1

        const score = (current_amount * 0.7 + progress * 1000 * 0.3) * recencyBoost

        return {
          ...c,
          current_amount,
          goal_amount: Number(c.goal_amount || 0),
          score
        }
      })
    )

    // 🔥 ORDEN FINAL POR SCORE
    const sorted = enriched.sort((a, b) => b.score - a.score)

    return NextResponse.json(sorted)

  } catch (error) {
    console.error("GET campaigns fatal:", error)
    return NextResponse.json([], { status: 200 })
  }
}

/* =========================
   🔐 POST (ORG FILTERED - ADMIN)
========================= */
export async function POST(req: Request) {
  try {

    const { user } = await req.json()
    const orgId = getOrgId(user)

    if (!orgId) {
      return NextResponse.json([], { status: 200 })
    }

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("POST campaigns error:", error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(campaigns || [])

  } catch (error) {
    console.error("POST campaigns fatal:", error)
    return NextResponse.json([], { status: 200 })
  }
}