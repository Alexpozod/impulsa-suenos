import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    /* =========================
       👤 EMAIL DESDE MIDDLEWARE
    ========================= */
    const userEmail = req.headers.get("x-user-email")

    if (!userEmail) {
      return NextResponse.json(
        { error: "No user email" },
        { status: 401 }
      )
    }

    /* =========================
       🔍 OBTENER USER ID REAL
    ========================= */
    const { data: user } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (!user?.id) {
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
       📊 CAMPAÑAS DEL USUARIO
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)

    const campaignIds = (campaigns || []).map(c => c.id)

    /* =========================
       💰 LEDGER (SOLO DE ESAS CAMPAÑAS)
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")
      .eq("status", "confirmed")
      .in(
        "campaign_id",
        campaignIds.length > 0
          ? campaignIds
          : ["00000000-0000-0000-0000-000000000000"]
      )

    if (!ledger) {
      return NextResponse.json({
        campaigns: campaigns || [],
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
       🔁 DESDE AQUÍ NO TOCO NADA
       (tu lógica original intacta)
    ========================= */

    const payments = ledger.filter(l => l.type === "payment")

    const withdrawals = ledger.filter(l => l.type === "withdraw")
    const pendingWithdrawals = ledger.filter(l => l.type === "withdraw_pending")
    const rejectedWithdrawals = ledger.filter(l => l.type === "withdraw_rejected")

    const feePlatform = ledger.filter(l => l.type === "fee_platform")
    const feeMP = ledger.filter(l => l.type === "fee_mp")

    const totalIncome = payments.reduce(
      (acc, d) => acc + Number(d.amount || 0),
      0
    )

    const totalUSD = payments.reduce(
      (acc, d) => acc + Number(d.amount_usd || 0),
      0
    )

    const totalTips = payments.reduce(
      (acc, d) => acc + Number(d.metadata?.tip || 0),
      0
    )

    const totalWithdrawals = withdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalPendingWithdrawals = pendingWithdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalRejectedWithdrawals = rejectedWithdrawals.reduce(
      (acc, w) => acc + Math.abs(Number(w.amount || 0)),
      0
    )

    const totalPlatformFees = feePlatform.reduce(
      (acc, f) => acc + Math.abs(Number(f.amount || 0)),
      0
    )

    const totalProviderFees = feeMP.reduce(
      (acc, f) => acc + Math.abs(Number(f.amount || 0)),
      0
    )

    const totalFees = totalPlatformFees

    const netIncome =
      totalIncome - totalPlatformFees - totalProviderFees

    const balance =
      netIncome - totalWithdrawals

    const providers: any = {}

    payments.forEach(d => {
      const provider = d.provider || "unknown"

      if (!providers[provider]) {
        providers[provider] = {
          total: 0,
          total_usd: 0,
          count: 0
        }
      }

      providers[provider].total += Number(d.amount || 0)
      providers[provider].total_usd += Number(d.amount_usd || 0)
      providers[provider].count += 1
    })

    const daily: any = {}

    payments.forEach(d => {
      const day = new Date(d.created_at).toISOString().split("T")[0]

      if (!daily[day]) {
        daily[day] = { total: 0, count: 0 }
      }

      daily[day].total += Number(d.amount || 0)
      daily[day].count += 1
    })

    const recentPayments = payments
      .sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)

    return NextResponse.json({

      campaigns: campaigns || [],

      totalIncome,
      totalUSD,
      totalTips,

      totalWithdrawals,
      totalPendingWithdrawals,
      totalRejectedWithdrawals,

      totalFees,
      totalPlatformFees,
      totalProviderFees,

      netIncome,
      balance,

      totals: {
        balance,
        raised: totalIncome,
        fees: totalFees,
        withdrawn: totalWithdrawals,
        pending: totalPendingWithdrawals
      },

      profit: totalPlatformFees,

      margin:
        totalIncome > 0
          ? (totalPlatformFees / totalIncome) * 100
          : 0,

      takeRate:
        totalIncome > 0
          ? ((totalPlatformFees + totalProviderFees) / totalIncome) * 100
          : 0,

      avgFeePerPayment:
        payments.length > 0
          ? totalPlatformFees / payments.length
          : 0,

      totalPayments: payments.length,
      providers,
      daily,
      recentPayments
    })

  } catch (error) {
    console.error("ADMIN FINANCE ERROR:", error)

    return NextResponse.json(
      { error: "finance error" },
      { status: 500 }
    )
  }
}