// app/api/admin/reconcile/route.ts

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
      .from("processed_payments")
      .select("*")

    const { data: payouts } = await supabase
      .from("payouts")
      .select("*")

    const issues: any[] = []

    const ledgerMap = new Map()
    const processedSet = new Set()
    const payoutLedgerSet = new Set()

    /* =========================
       MAPS
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
       🔴 PAGOS
    ========================= */

    for (const p of processed || []) {
      if (!ledgerMap.has(p.payment_id)) {
        issues.push({
          payment_id: p.payment_id,
          issue_type: "missing_in_ledger"
        })
      }
    }

    for (const l of ledger || []) {
      if (l.type === "payment" && l.payment_id && !processedSet.has(l.payment_id)) {
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
       ALERTAS
    ========================= */

    if (issues.length > 0) {
      await sendAlert({
        title: "Problemas de conciliación",
        message: "Se detectaron inconsistencias críticas",
        data: issues
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