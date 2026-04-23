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
       🔐 AUTH (SEGURO)
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

    console.log("👤 USER EMAIL:", user_email)

    /* =========================
       📊 CAMPAÑAS (FIX CRÍTICO)
    ========================= */

    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("id, title, user_email")
      .ilike("user_email", user_email) // 🔥 FIX REAL

    if (campaignsError) {
      console.error("❌ Campaigns error:", campaignsError)
      return NextResponse.json({ error: "campaigns error" }, { status: 500 })
    }

    console.log("📊 CAMPAIGNS FOUND:", campaigns?.length)

    const campaignIds = campaigns?.map(c => c.id) || []

    if (campaignIds.length === 0) {
      return NextResponse.json({
        campaigns: [],
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

    const { data: ledger, error: ledgerError } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)
      .eq("status", "confirmed")

    if (ledgerError) {
      console.error("❌ Ledger error:", ledgerError)
    }

    /* =========================
       🏦 PAYOUTS
    ========================= */

    const { data: payouts, error: payoutsError } = await supabase
      .from("payouts")
      .select("*")
      .in("campaign_id", campaignIds)

    if (payoutsError) {
      console.error("❌ Payouts error:", payoutsError)
    }

    /* =========================
       📊 TOTALES
    ========================= */

    const totalRaised = ledger
      ?.filter(l => l.type === "payment")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalFees = ledger
      ?.filter(l => l.type === "fee_mp" || l.type === "fee_platform")
      .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0) || 0

    const totalBalance = ledger
      ?.reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalWithdrawn = ledger
      ?.filter(l => l.type === "withdraw")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

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
        .filter(l => l.type === "fee_mp" || l.type === "fee_platform")
        .reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0)

      const balance = campaignLedger
        .reduce((sum, l) => sum + Number(l.amount || 0), 0)

      const withdrawn = campaignLedger
        .filter(l => l.type === "withdraw")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0)

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
        available: balance
      }
    })

    return NextResponse.json({
      campaigns: campaignsData,
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