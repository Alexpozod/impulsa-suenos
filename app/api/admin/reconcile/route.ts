import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logInfo, logError } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    logInfo("Reconciliation started")

    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")

    const { data: processed } = await supabase
      .from("processed_payments")
      .select("*")

    const issues: any[] = []

    const ledgerMap = new Map()
    const processedSet = new Set()

    // =========================
    // INDEXAR
    // =========================
    for (const l of ledger || []) {
      if (l.payment_id) {
        ledgerMap.set(l.payment_id, l)
      }
    }

    for (const p of processed || []) {
      processedSet.add(p.payment_id)
    }

    // =========================
    // 1. FALTA EN LEDGER
    // =========================
    for (const p of processed || []) {
      if (!ledgerMap.has(p.payment_id)) {
        issues.push({
          payment_id: p.payment_id,
          issue_type: "missing_in_ledger"
        })
      }
    }

    // =========================
    // 2. FALTA EN PASARELA
    // =========================
    for (const l of ledger || []) {
      if (l.payment_id && !processedSet.has(l.payment_id)) {
        issues.push({
          payment_id: l.payment_id,
          campaign_id: l.campaign_id,
          ledger_amount: l.amount,
          issue_type: "missing_in_gateway"
        })
      }
    }

    // =========================
    // 3. DUPLICADOS
    // =========================
    const seen = new Set()

    for (const l of ledger || []) {
      if (!l.payment_id) continue

      if (seen.has(l.payment_id)) {
        issues.push({
          payment_id: l.payment_id,
          issue_type: "duplicate"
        })
      } else {
        seen.add(l.payment_id)
      }
    }

    // =========================
    // 💾 LOG DB
    // =========================
    if (issues.length > 0) {
      await supabase.from("reconciliation_logs").insert(
        issues.map(i => ({
          ...i,
          status: "open"
        }))
      )

      await logToDB("error", "reconciliation_issues_found", {
        count: issues.length
      })
    } else {
      await logToDB("info", "reconciliation_clean", {})
    }

    logInfo("Reconciliation completed", {
      issues: issues.length
    })

    return NextResponse.json({
      ok: true,
      issues_found: issues.length,
      issues
    })

  } catch (error) {
    logError("reconciliation error", error)
    await logErrorToDB("reconciliation_error", error)

    return NextResponse.json(
      { error: "reconciliation error" },
      { status: 500 }
    )
  }
}