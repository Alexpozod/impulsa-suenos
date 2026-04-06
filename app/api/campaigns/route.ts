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

    /* 🔥 CALCULAR DINERO REAL (CLAVE) */
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

        return {
          ...c,
          current_amount,
          goal_amount: Number(c.goal_amount || 0)
        }
      })
    )

    return NextResponse.json(enriched)

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

    const enriched = await Promise.all(
      (campaigns || []).map(async (c) => {

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount")
          .eq("campaign_id", c.id)
          .eq("organization_id", orgId)
          .eq("flow_type", "in")
          .eq("status", "confirmed")

        const total =
          ledger?.reduce((acc, d) => acc + Number(d.amount), 0) || 0

        const { count: ticketsSold } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", c.id)

        return {
          ...c,
          current_amount: total,
          ticketsSold: ticketsSold || 0
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    console.error("POST campaigns fatal:", error)
    return NextResponse.json([], { status: 200 })
  }
}