import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendAlert } from "@/lib/alerts/sendAlert"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const cutoff = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: pending } = await supabase
      .from("financial_ledger")
      .select("id, user_email, amount")
      .eq("flow_type", "in")
      .eq("status", "pending")
      .lte("created_at", cutoff)

    if (!pending || pending.length === 0) {
      return NextResponse.json({ ok: true })
    }

    for (const p of pending) {

      /* =========================
         💰 MOVER WALLET
      ========================= */
      await supabase.rpc("update_wallet_release_funds", {
        p_user_email: p.user_email,
        p_amount: p.amount
      })
    }

    const ids = pending.map(p => p.id)

    await supabase
      .from("financial_ledger")
      .update({ status: "confirmed" })
      .in("id", ids)

    return NextResponse.json({
      ok: true,
      released: ids.length
    })

  } catch (error) {

    await sendAlert({
      title: "Error liberación fondos",
      message: "Falló liberación automática",
      data: { error }
    })

    return NextResponse.json(
      { error: "release error" },
      { status: 500 }
    )
  }
}