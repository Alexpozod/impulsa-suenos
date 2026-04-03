import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    // 📊 campañas del usuario
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id")
      .eq("user_email", user.email)

    const campaignIds = campaigns?.map(c => c.id) || []

    if (campaignIds.length === 0) {
      return NextResponse.json({
        balance: 0,
        available: 0,
        pending: 0,
        movements: [],
        payouts: []
      })
    }

    // 💰 ledger
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false })

    // 🏦 payouts
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .in("campaign_id", campaignIds)
      .order("created_at", { ascending: false })

    const deposits = ledger?.filter(l => l.type === "deposit") || []
    const withdrawals = ledger?.filter(l => l.type === "withdraw") || []

    const totalIncome = deposits.reduce((acc, d) => acc + Number(d.amount), 0)
    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + Number(w.amount), 0)

    const balance = totalIncome - totalWithdrawn

    const pendingPayouts = payouts?.filter(p => p.status === "pending") || []
    const pendingAmount = pendingPayouts.reduce((acc, p) => acc + Number(p.amount), 0)

    const available = balance - pendingAmount

    return NextResponse.json({
      balance,
      available,
      pending: pendingAmount,
      movements: ledger || [],
      payouts: payouts || []
    })

  } catch (error) {
    return NextResponse.json({ error: "finance error" }, { status: 500 })
  }
}