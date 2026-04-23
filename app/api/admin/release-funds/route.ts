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

    // 🔐 ADMIN
    await requireAdmin(req)

    // 🔐 LOCK GLOBAL (evita doble ejecución del endpoint completo)
    await supabase.rpc("advisory_lock", {
      lock_key: "release_funds_cron"
    })

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

    const processedIds: string[] = []

    for (const p of pending) {

      // 🔐 IDEMPOTENCIA POR REGISTRO
      const { data: alreadyProcessed } = await supabase
        .from("financial_ledger")
        .select("id")
        .eq("id", p.id)
        .eq("status", "confirmed")
        .maybeSingle()

      if (alreadyProcessed) continue

      /* =========================
         💰 MOVER WALLET (NO TOCAR)
      ========================= */
      await supabase.rpc("update_wallet_release_funds", {
        p_user_email: p.user_email,
        p_amount: p.amount
      })

      processedIds.push(p.id)
    }

    // 🔥 UPDATE MASIVO SOLO DE LOS PROCESADOS
    if (processedIds.length > 0) {
      await supabase
        .from("financial_ledger")
        .update({ status: "confirmed" })
        .in("id", processedIds)
    }

    return NextResponse.json({
      ok: true,
      released: processedIds.length
    })

  } catch (error: any) {

    if (
      error.message === "unauthorized" ||
      error.message === "invalid user"
    ) {
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