import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 💰 TOTAL COMISIONES
    const { data: commissions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "commission")

    const totalCommissions = commissions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0

    // 💸 TOTAL RETIROS
    const { data: withdrawals } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "withdrawal")

    const totalWithdrawals = withdrawals?.reduce((acc, t) => acc + Number(t.amount), 0) || 0

    // 📈 DONACIONES
    const { data: donations } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "deposit")

    const totalDonations = donations?.reduce((acc, t) => acc + Number(t.amount), 0) || 0

    // 🚨 USUARIOS RIESGO
    const { data: riskyUsers } = await supabase
      .from("user_risk")
      .select("id")
      .gte("score", 70)

    const totalRisky = riskyUsers?.length || 0

    // 📊 HISTÓRICO (últimos 7 días)
    const { data: history } = await supabase
      .from("transactions")
      .select("amount, created_at")
      .eq("type", "commission")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      totalCommissions,
      totalWithdrawals,
      totalDonations,
      totalRisky,
      history: history || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error cargando métricas" },
      { status: 500 }
    )
  }
}
