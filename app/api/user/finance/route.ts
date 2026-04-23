import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

export const runtime = "nodejs"

export async function GET() {
  try {

    /* 🔐 AUTH REAL (NO service_role) */
    const cookieStore = cookies()

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {}
        }
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase()

    /* 🔥 TU LÓGICA ORIGINAL (INTACTA) */
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)
      .eq("status", "confirmed")

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")
      .in("campaign_id", campaignIds)

    /* 👇 TODO tu cálculo queda igual */

    const totalRaised = ledger?.filter(l => l.type === "payment")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalFees = ledger?.filter(l =>
      l.type === "fee_mp" || l.type === "fee_platform"
    ).reduce((sum, l) => sum + Math.abs(Number(l.amount || 0)), 0) || 0

    const totalBalance = ledger
      ?.reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const totalWithdrawn = ledger?.filter(l => l.type === "withdraw")
      .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0

    const pendingAmount = payouts?.filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0

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