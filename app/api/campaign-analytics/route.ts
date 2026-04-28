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
       🔥 TRAER PAYMENTS REALES
    ========================= */
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, metadata, ref, source, created_at")
      .eq("campaign_id", campaign_id)
      .eq("status", "approved")

    if (!payments || payments.length === 0) {
      return NextResponse.json({
        total_donations: 0,
        total_amount: 0,
        refs: 0,
        sources: {},
        conversion: 0
      })
    }

    /* =========================
       💰 TOTAL
    ========================= */
    const total_amount = payments.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    )

    const total_donations = payments.length

    /* =========================
       🔗 REFERIDOS
    ========================= */
    const refSet = new Set<string>()

    payments.forEach(p => {
      const ref =
        p.ref ||
        p.metadata?.ref ||
        p.metadata?.referrer

      if (ref) refSet.add(ref)
    })

    const total_refs = refSet.size

    /* =========================
       🌍 SOURCES (TRÁFICO)
    ========================= */
    const sources: Record<string, { count: number; amount: number }> = {}

    payments.forEach(p => {
      const source =
        p.source ||
        p.metadata?.source ||
        "direct"

      if (!sources[source]) {
        sources[source] = { count: 0, amount: 0 }
      }

      sources[source].count += 1
      sources[source].amount += Number(p.amount || 0)
    })

    /* =========================
       📈 CONVERSIÓN (SIMPLE)
    ========================= */
    const estimated_visits = total_donations * 3 // aproximación inicial
    const conversion =
      estimated_visits > 0
        ? Number(((total_donations / estimated_visits) * 100).toFixed(2))
        : 0

    return NextResponse.json({
      total_donations,
      total_amount,
      refs: total_refs,
      sources,
      conversion
    })

  } catch (err) {
    console.error("ANALYTICS ERROR:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}