import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    console.log("🔥 RISK API HIT")

    /* =========================
       👥 RISK USERS
    ========================= */
    const { data: riskUsers, error: riskError } = await supabase
      .from("user_risk")
      .select("*")
      .order("score", { ascending: false })

    if (riskError) {
      console.log("❌ user_risk error:", riskError)
    }

    /* =========================
       💸 RETIROS (CORRECTO)
    ========================= */
    const { data: payouts, error: payoutError } = await supabase
      .from("payouts") // ✅ CORRECTO
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (payoutError) {
      console.log("❌ payouts error:", payoutError)
    }

    /* =========================
       🚨 FRAUD ALERTS (CORRECTO)
    ========================= */
    const { data: fraudAlerts, error: fraudError } = await supabase
      .from("fraud_alerts") // ✅ CORRECTO
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (fraudError) {
      console.log("❌ fraud_alerts error:", fraudError)
    }

    return NextResponse.json({
      risk_users: riskUsers || [],
      pending_withdrawals: payouts || [],
      fraud_logs: fraudAlerts || [],
      payment_events: [] // futuro
    })

  } catch (error) {

    console.log("🔥 ERROR GENERAL:", error)

    return NextResponse.json({
      risk_users: [],
      pending_withdrawals: [],
      fraud_logs: [],
      payment_events: []
    })
  }
}