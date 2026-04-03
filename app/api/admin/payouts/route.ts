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

    // =========================
    // 🏦 PAYOUTS
    // =========================
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!payouts) {
      return NextResponse.json([])
    }

    // =========================
    // 📊 ENRIQUECER DATA
    // =========================
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

        const deposits = ledger?.filter(l => l.type === "deposit") || []
        const withdrawals = ledger?.filter(l => l.type === "withdraw") || []

        const totalIncome = deposits.reduce((acc, d) => acc + Number(d.amount), 0)
        const totalWithdrawn = withdrawals.reduce((acc, w) => acc + Number(w.amount), 0)

        const balance = totalIncome - totalWithdrawn

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
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}