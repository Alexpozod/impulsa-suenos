import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔥 usuarios con riesgo
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

    // 🔥 retiros sospechosos
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

    // 🔥 logs fraude (si existen)
    const { data: logs } = await supabase
      .from("fraud_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    return NextResponse.json({
      risk_users: riskUsers,
      pending_withdrawals: withdrawals,
      fraud_logs: logs || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
