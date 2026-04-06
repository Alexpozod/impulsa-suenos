import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendAlert } from "@/lib/alerts/sendAlert"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // ⏱️ 24 HORAS HOLD
    const cutoff = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    // 🔍 buscar fondos retenidos
    const { data: pending, error } = await supabase
      .from("financial_ledger")
      .select("id, campaign_id, amount")
      .eq("flow_type", "in")
      .eq("status", "pending")
      .lte("created_at", cutoff)

    if (error) {
      throw error
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No hay fondos para liberar"
      })
    }

    const ids = pending.map(p => p.id)

    // 🔓 liberar fondos
    const { error: updateError } = await supabase
      .from("financial_ledger")
      .update({ status: "confirmed" })
      .in("id", ids)

    if (updateError) {
      throw updateError
    }

    // 📊 LOG OPCIONAL
    await supabase.from("audit_logs").insert({
      event: "funds_released",
      metadata: {
        count: ids.length,
        timestamp: new Date().toISOString()
      }
    })

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