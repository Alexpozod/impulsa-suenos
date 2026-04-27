import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAIL = "contacto@impulsasuenos.com"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* =========================
       🏦 PAYOUTS
    ========================= */
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!payouts) {
      return NextResponse.json([])
    }

    /* =========================
       📊 ENRIQUECER DATA (FIX REAL)
    ========================= */
    const enriched = await Promise.all(
      payouts.map(async (p) => {

        // 🎯 CAMPAÑA
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("title, user_email")
          .eq("id", p.campaign_id)
          .maybeSingle()

        // 📥 LEDGER REAL
        const { data: ledger } = await supabase
          .from("financial_ledger")
          .select("amount, type")
          .eq("campaign_id", p.campaign_id)
          .eq("status", "confirmed")

        /* =========================
           🔥 LÓGICA FINANCIERA CORRECTA
        ========================= */

        const creatorNet = ledger?.filter(l => l.type === "creator_net") || []
        const withdrawals = ledger?.filter(l => l.type === "withdraw") || []
        const pending = ledger?.filter(l => l.type === "withdraw_pending") || []

        const totalIncome = creatorNet.reduce(
          (acc, d) => acc + Number(d.amount || 0),
          0
        )

        const totalWithdrawn = withdrawals.reduce(
          (acc, w) => acc + Math.abs(Number(w.amount || 0)),
          0
        )

        const totalPending = pending.reduce(
          (acc, w) => acc + Math.abs(Number(w.amount || 0)),
          0
        )

        const balance = totalIncome - totalWithdrawn
        const available = balance - totalPending

        return {
          ...p,
          campaign_title: campaign?.title,
          owner: campaign?.user_email,

          // 🔥 CLAVE
          balance,
          pending: totalPending,
          available
        }
      })
    )

    return NextResponse.json(enriched)

  } catch (error) {
    console.error("ADMIN PAYOUTS ERROR:", error)

    return NextResponse.json(
      { error: "error" },
      { status: 500 }
    )
  }
}