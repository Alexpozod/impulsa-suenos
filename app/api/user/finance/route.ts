import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

export const runtime = "nodejs"

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

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase().trim()

    /* =========================
       📊 CAMPAÑAS
    ========================= */

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .ilike("user_email", user_email)

    const campaignIds = campaigns?.map(c => c.id) || []

    if (campaignIds.length === 0) {
      return NextResponse.json({
        campaigns: [],
        movements: [],
        totals: {
          balance: 0,
          raised: 0,
          fees: 0,
          withdrawn: 0,
          pending: 0
        }
      })
    }

    /* =========================
       💰 LEDGER
    ========================= */

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)
      .eq("status", "confirmed")

    /* =========================
       🏦 PAYOUTS
    ========================= */

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .in("campaign_id", campaignIds)

    /* =========================
       📊 TOTALES
    ========================= */

    const totalRaised = ledger
      ?.filter(l => l.type === "payment")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalFees = ledger
      ?.filter(l =>
        l.type === "fee_mp" ||
        l.type === "fee_platform" ||
        l.type === "fee_platform_iva"
      )
      .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0) || 0

    const totalCreatorNet = ledger
      ?.filter(l => l.type === "creator_net")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalWithdrawn = ledger
      ?.filter(l => l.type === "withdraw")
      .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0) || 0

    const totalBalance = totalCreatorNet - totalWithdrawn

    const pendingAmount = payouts
      ?.filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0

    /* =========================
       📊 POR CAMPAÑA
    ========================= */

    const campaignsData = (campaigns || []).map(c => {

      const campaignLedger = ledger?.filter(l => l.campaign_id === c.id) || []
      const campaignPayouts = payouts?.filter(p => p.campaign_id === c.id) || []

      const raised = campaignLedger
        .filter(l => l.type === "payment")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0)

      const fees = campaignLedger
        .filter(l =>
          l.type === "fee_mp" ||
          l.type === "fee_platform" ||
          l.type === "fee_platform_iva"
        )
        .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0)

      const creatorNet = campaignLedger
        .filter(l => l.type === "creator_net")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0)

      const withdrawn = campaignLedger
        .filter(l => l.type === "withdraw")
        .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0)

      const pending = campaignPayouts
        .filter(p => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)

      return {
        id: c.id,
        title: c.title,
        raised,
        fees,
        withdrawn,
        pending,
        available: creatorNet - withdrawn
      }
    })

    /* =========================
   📜 MOVIMIENTOS (FIX PRO REAL)
========================= */

const campaignMap = (campaigns || []).reduce((acc, c) => {
  acc[c.id] = c.title
  return acc
}, {} as Record<string, string>)

const movements = [

  ...(ledger || [])
    .filter(l => l.type === "creator_net")
    .map(l => ({
      id: l.id,
      type: "donation",
      amount: Number(l.amount),
      campaign_id: l.campaign_id,
      campaign_title: campaignMap[l.campaign_id] || "Campaña",
      created_at: l.created_at
    })),

  ...(payouts || []).map(p => ({
    id: p.id,
    type: "withdraw",
    amount: Number(p.amount),
    campaign_id: p.campaign_id,
    campaign_title: campaignMap[p.campaign_id] || "Campaña",
    status: p.status,
    created_at: p.created_at
  }))

]
.sort((a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
)
.slice(0, 10)

    /* =========================
       ✅ RESPONSE FINAL
    ========================= */

    return NextResponse.json({
      campaigns: campaignsData,
      movements,
      totals: {
        balance: totalBalance,
        raised: totalRaised,
        fees: totalFees,
        withdrawn: totalWithdrawn,
        pending: pendingAmount
      }
    })

  } catch (error) {

    console.error("❌ FINANCE ERROR:", error)

    await logErrorToDB("finance_error", error)

    await sendAlert({
      title: "Finance error",
      message: "Fallo endpoint financiero",
      data: { error }
    })

    return NextResponse.json(
      { error: "finance error" },
      { status: 500 }
    )
  }
}