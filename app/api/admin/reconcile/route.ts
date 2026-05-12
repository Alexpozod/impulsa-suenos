import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendAlert } from "@/lib/alerts/sendAlert"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")

    const { data: processed } = await supabase
      .from("payments")
      .select("payment_id")

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")

    const { data: wallets } = await supabase
      .from("wallets")
      .select("*")

    // 🔥 NUEVO: traer payments reales
    const { data: payments } = await supabase
      .from("payments")
      .select("payment_id")

    const validPayments = new Set(
      (payments || []).map(p => p.payment_id)
    )

    const issues: any[] = []

    const ledgerMap = new Map()
    const processedSet = new Set()
    const payoutLedgerSet = new Set()

    /* =========================
       MAPS EXISTENTES
    ========================= */

    for (const l of ledger || []) {
      if (l.payment_id) {
        ledgerMap.set(l.payment_id, l)
      }

      if (l.type === "withdraw") {
        payoutLedgerSet.add(l.payment_id)
      }
    }

    for (const p of processed || []) {
      processedSet.add(p.payment_id)
    }

    /* =========================
       🔴 PAGOS (FIX PRO)
    ========================= */

    for (const p of processed || []) {

      // 🔥 IGNORAR HUÉRFANOS
      if (!validPayments.has(p.payment_id)) {
        continue
      }

      if (!ledgerMap.has(p.payment_id)) {
        issues.push({
          payment_id: p.payment_id,
          issue_type: "missing_in_ledger"
        })
      }
    }

    for (const l of ledger || []) {

      if (l.type !== "payment" || !l.payment_id) continue

      // 🔥 IGNORAR HUÉRFANOS
      if (!validPayments.has(l.payment_id)) {
        continue
      }

      if (!processedSet.has(l.payment_id)) {
        issues.push({
          payment_id: l.payment_id,
          campaign_id: l.campaign_id,
          issue_type: "missing_in_gateway"
        })
      }
    }

    /* =========================
       🔴 PAYOUTS
    ========================= */

    for (const p of payouts || []) {
      const expectedId = `payout_${p.id}`

      if (p.status === "paid" && !payoutLedgerSet.has(expectedId)) {
        issues.push({
          payout_id: p.id,
          campaign_id: p.campaign_id,
          issue_type: "payout_missing_in_ledger"
        })
      }
    }
   
    /* =========================
       🚨 ALERTAS
    ========================= */

    if (issues.length > 0) {
      await sendAlert({
        title: "Problemas de conciliación",
        message: "Se detectaron inconsistencias críticas",
        data: issues.slice(0, 10)
      })
    }

    return NextResponse.json({
      ok: true,
      issues_found: issues.length,
      issues
    })

  } catch (error) {

    await sendAlert({
      title: "Error conciliación",
      message: "Fallo sistema",
      data: { error }
    })

    return NextResponse.json(
      { error: "reconciliation error" },
      { status: 500 }
    )
  }
}