import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    /* =========================
       🔐 AUTH
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user?.id) {
      return NextResponse.json({ error: "invalid_user" }, { status: 401 })
    }

    /* =========================
       🔐 VALIDAR ADMIN REAL (NO EMAIL)
    ========================= */
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* =========================
       📥 PAYOUTS
    ========================= */
    const { data: payouts, error } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "payouts_error" }, { status: 500 })
    }

    if (!payouts || payouts.length === 0) {
      return NextResponse.json([])
    }

    /* =========================
       📊 ENRIQUECER (FIX REAL)
    ========================= */
    const enriched = await Promise.all(
      payouts.map(async (p) => {

        const { data: campaign } = await supabase
          .from("campaigns")
          .select("title, user_email")
          .eq("id", p.campaign_id)
          .maybeSingle()

        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount, type")
          .eq("campaign_id", p.campaign_id)
          .eq("status", "confirmed")

        let balance = 0

        for (const l of ledger || []) {
          const amount = Number(l.amount || 0)

          // 🔥 SOLO LO REAL DEL USUARIO
          if (l.type === "creator_net") {
            balance += amount
          }

          if (l.type === "withdraw") {
            balance -= Math.abs(amount)
          }

          // ⚠️ NO RESTAMOS withdraw_pending
        }

        return {
          ...p,
          campaign_title: campaign?.title,
          owner: campaign?.user_email,
          balance
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    console.error("ADMIN PAYOUTS ERROR:", error)

    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}