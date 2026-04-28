import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const campaign_id = url.searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json({ error: "missing campaign_id" }, { status: 400 })
    }

    /* =========================
       💰 LEDGER (FUENTE REAL)
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("amount, payment_id")
      .eq("campaign_id", campaign_id)
      .eq("type", "payment")
      .eq("status", "confirmed")

    if (!ledger || ledger.length === 0) {
      return NextResponse.json({
        total_donations: 0,
        total_amount: 0,
        refs: 0,
        sources: {},
        conversion: 0
      })
    }

    const paymentIds = ledger.map(l => l.payment_id)

    /* =========================
       🔍 TRAER METADATA
    ========================= */
    const { data: payments } = await supabase
      .from("payments")
      .select("payment_id, ref, source, metadata")
      .in("payment_id", paymentIds)

    const paymentsMap: Record<string, any> = {}

    ;(payments || []).forEach(p => {
      paymentsMap[p.payment_id] = p
    })

    /* =========================
       💰 TOTAL
    ========================= */
    const total_amount = ledger.reduce(
      (acc, l) => acc + Number(l.amount || 0),
      0
    )

    const total_donations = ledger.length

    /* =========================
       🔗 REFERIDOS
    ========================= */
    const refSet = new Set<string>()

    ledger.forEach(l => {
      const p = paymentsMap[l.payment_id]

      const ref =
        p?.ref ||
        p?.metadata?.ref ||
        p?.metadata?.referrer

      if (ref) refSet.add(ref)
    })

    /* =========================
       🌍 SOURCES
    ========================= */
    const sources: Record<string, { count: number; amount: number }> = {}

    ledger.forEach(l => {
      const p = paymentsMap[l.payment_id]

      const source =
        p?.source ||
        p?.metadata?.source ||
        "direct"

      if (!sources[source]) {
        sources[source] = { count: 0, amount: 0 }
      }

      sources[source].count += 1
      sources[source].amount += Number(l.amount || 0)
    })

    /* =========================
       📈 CONVERSIÓN
    ========================= */
    const estimated_visits = total_donations * 3

    const conversion =
      estimated_visits > 0
        ? Number(((total_donations / estimated_visits) * 100).toFixed(2))
        : 0

    return NextResponse.json({
      total_donations,
      total_amount,
      refs: refSet.size,
      sources,
      conversion
    })

  } catch (err) {
    console.error("ANALYTICS ERROR:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}