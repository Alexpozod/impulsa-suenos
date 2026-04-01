import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { emitEvent } from "@/lib/events/eventBus"

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

    const issues: any[] = []
    let critical = 0

    const ledgerMap = new Map()
    const processedSet = new Set()

    for (const l of ledger || []) {
      if (l.payment_id) {
        ledgerMap.set(l.payment_id, l)
      }
    }

    for (const p of processed || []) {
      processedSet.add(p.payment_id)
    }

    // =========================
    // 🔴 FALTA EN LEDGER (CRÍTICO)
    // =========================
    for (const p of processed || []) {
      if (!ledgerMap.has(p.payment_id)) {
        critical++

        issues.push({
          payment_id: p.payment_id,
          issue_type: "missing_in_ledger",
          severity: "critical"
        })
      }
    }

    // =========================
    // 🟡 FALTA EN PASARELA
    // =========================
    for (const l of ledger || []) {
      if (l.payment_id && !processedSet.has(l.payment_id)) {
        issues.push({
          payment_id: l.payment_id,
          issue_type: "missing_in_gateway",
          severity: "warning"
        })
      }
    }

    // =========================
    // 🔁 DUPLICADOS
    // =========================
    const seen = new Set()

    for (const l of ledger || []) {
      if (!l.payment_id) continue

      if (seen.has(l.payment_id)) {
        issues.push({
          payment_id: l.payment_id,
          issue_type: "duplicate",
          severity: "warning"
        })
      } else {
        seen.add(l.payment_id)
      }
    }

    // =========================
    // 💾 LOG
    // =========================
    if (issues.length > 0) {
      await supabase.from("reconciliation_logs").insert(
        issues.map(i => ({
          ...i,
          status: "open"
        }))
      )
    }

    // =========================
    // 🚨 ALERTAS
    // =========================
    if (critical > 0) {
      await emitEvent("system.critical_reconciliation", {
        critical_issues: critical
      })
    }

    // =========================
    // 📊 SYSTEM HEALTH
    // =========================
    let status = "healthy"

    if (critical > 0) status = "critical"
    else if (issues.length > 0) status = "warning"

    await supabase.from("system_health").insert({
      last_reconciliation: new Date().toISOString(),
      issues_detected: issues.length,
      critical_issues: critical,
      status
    })

    return NextResponse.json({
      ok: true,
      issues: issues.length,
      critical,
      status
    })

  } catch (error) {
    console.error("❌ AUTO RECON ERROR:", error)

    return NextResponse.json(
      { error: "auto reconcile error" },
      { status: 500 }
    )
  }
}
