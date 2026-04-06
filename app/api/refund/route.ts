import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { canAccess } from "@/lib/auth/rbac"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { payment_id, campaign_id, amount, reason } = await req.json()

    if (!payment_id || !campaign_id || !amount) {
      return NextResponse.json({ error: "missing data" }, { status: 400 })
    }

    /* =========================
       🔐 AUTH
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    const role = user.user_metadata?.role || "user"

    if (!canAccess(role, "refund.execute")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* =========================
       🔥 RPC REFUND
    ========================= */
    const { data, error } = await supabase.rpc("process_refund_atomic", {
      p_payment_id: payment_id,
      p_campaign_id: campaign_id,
      p_amount: amount,
      p_reason: reason || "manual_refund"
    })

    if (error) {
      await logErrorToDB("refund_error", error)

      await sendAlert({
        title: "ERROR REFUND",
        message: "Fallo en refund",
        data: { payment_id }
      })

      return NextResponse.json({ error: "refund_failed" }, { status: 500 })
    }

    await logToDB("info", "refund_processed", {
      payment_id,
      campaign_id,
      amount
    })

    return NextResponse.json({
      ok: true,
      result: data
    })

  } catch (error) {
    await logErrorToDB("refund_fatal", error)

    return NextResponse.json(
      { error: "refund_error" },
      { status: 500 }
    )
  }
}