import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    /* =========================
       🔐 AUTH ADMIN
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user }
    } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    const role = user.user_metadata?.role || "user"

    if (role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const orgId = user.user_metadata?.organization_id

    if (!orgId) {
      return NextResponse.json({ error: "no organization" }, { status: 403 })
    }

    /* =========================
       📊 QUERY WITHDRAWALS
    ========================= */
    const { data, error } = await supabase
      .from("payouts")
      .select(`
        id,
        amount,
        status,
        created_at,
        processed_at,
        campaign_id
      `)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ FETCH WITHDRAWALS ERROR:", error)
      return NextResponse.json({ error: "error fetching withdrawals" }, { status: 500 })
    }

    /* =========================
       📊 ENRICH DATA
    ========================= */
    const enriched = (data || []).map(w => ({
      ...w,
      isPending: w.status === "pending",
      isPaid: w.status === "paid",
      isBlocked: w.status === "blocked"
    }))

    return NextResponse.json(enriched)

  } catch (error) {
    console.error("❌ WITHDRAWALS API ERROR:", error)

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}