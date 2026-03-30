import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       🔥 RISK USERS
    ========================= */
    const { data: riskUsers, error: riskError } = await supabase
      .from("user_risk")
      .select("*")
      .order("score", { ascending: false })

    if (riskError) {
      return NextResponse.json(
        { error: "Error cargando risk users" },
        { status: 500 }
      )
    }

    /* =========================
       🔥 WITHDRAWALS
    ========================= */
    const { data: withdrawals, error: wError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (wError) {
      return NextResponse.json(
        { error: "Error cargando withdrawals" },
        { status: 500 }
      )
    }

    /* =========================
       🔥 FRAUD LOGS
    ========================= */
    const { data: logs } = await supabase
      .from("fraud_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    /* =========================
       💳 PAYMENT EVENTS (CLAVE)
    ========================= */
    const { data: paymentEvents, error: paymentError } = await supabase
      .from("payment_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500) // ⚠️ controlamos carga

    if (paymentError) {
      return NextResponse.json(
        { error: "Error cargando payment events" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      risk_users: riskUsers,
      pending_withdrawals: withdrawals,
      fraud_logs: logs || [],
      payment_events: paymentEvents || [] // 🔥 NUEVO
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
