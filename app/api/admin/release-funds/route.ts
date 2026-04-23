import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { requireAdmin } from "@/lib/auth/requireAdmin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    // 🔐 PROTECCIÓN ADMIN (NO TOCAR NADA MÁS)
    await requireAdmin(req)

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

  } catch (error: any) {

    if (error.message === "unauthorized" || error.message === "invalid user") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (error.message === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

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