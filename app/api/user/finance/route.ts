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
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase()

    /* =========================
       📊 CAMPAÑAS
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("user_email", user_email)

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
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)

    /* =========================
       🏦 PAYOUTS
    ========================= */
    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .in("campaign_id", campaignIds)

    /* =========================
       📊 CALCULOS
    ========================= */
    const totalRaised = ledger
      ?.filter(l => l.type === "payment")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalFees = ledger
      ?.filter(l => l.type === "fee")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalNet = ledger
      ?.filter(l => l.type === "net")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalWithdrawn = ledger
      ?.filter(l => l.type === "withdraw")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const pendingAmount = payouts
      ?.filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0

    const campaignsData = (campaigns || []).map(c => {

      const campaignLedger = ledger?.filter(l => l.campaign_id === c.id) || []
      const campaignPayouts = payouts?.filter(p => p.campaign_id === c.id) || []

      const raised = campaignLedger
        .filter(l => l.type === "payment")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0)

      const net = campaignLedger
        .filter(l => l.type === "net")
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
        net,
        withdrawn,
        pending,
        available: net - withdrawn - pending
      }
    })

    return NextResponse.json({
      campaigns: campaignsData,
      totals: {
        balance: totalNet - totalWithdrawn - pendingAmount,
        raised: totalRaised,
        fees: Math.abs(totalFees),
        withdrawn: totalWithdrawn,
        pending: pendingAmount
      }
    })

  } catch (error) {
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