import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    /* =========================
       📊 LEDGER (SOLO CONFIRMADOS)
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("campaign_id, type, amount")
      .eq("status", "confirmed")

    /* =========================
       📊 CAMPAÑAS (IMPORTANTE)
    ========================= */
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, title")

    if (!ledger || !campaigns) {
      return NextResponse.json([])
    }

    /* =========================
       🧠 MAPA BASE (TU LÓGICA)
    ========================= */
    const map: any = {}

    for (const l of ledger) {

      if (!l.campaign_id) continue

      if (!map[l.campaign_id]) {
        map[l.campaign_id] = {
          income: 0,
          withdrawn: 0,
          fees: 0
        }
      }

      if (l.type === "payment") {
        map[l.campaign_id].income += Number(l.amount || 0)
      }

      if (
  l.type === "fee_platform" ||
  l.type === "fee_platform_iva" ||
  l.type === "fee_mp"
) {
  map[l.campaign_id].fees += Math.abs(Number(l.amount || 0))
}

      /* 🔥 FIX REAL: TODAS LAS FEES */
      if (
        l.type === "fee_platform" ||
        l.type === "fee_platform_iva" ||
        l.type === "fee_mp"
      ) {
        map[l.campaign_id].fees += Math.abs(Number(l.amount || 0))
      }
    }

    /* =========================
       📦 RESULTADO COMPLETO
       (INCLUYE TODAS LAS CAMPAÑAS)
    ========================= */
    const result = campaigns.map((c) => {

      const data = map[c.id] || {
        income: 0,
        withdrawn: 0,
        fees: 0
      }

      return {
        campaign_id: c.id,
        title: c.title,
        income: data.income,
        withdrawn: data.withdrawn,
        fees: data.fees,
        balance: data.income - data.withdrawn - data.fees
      }
    })

    /* =========================
       🔝 ORDEN (MEJOR UX)
    ========================= */
    result.sort((a, b) => b.balance - a.balance)

    return NextResponse.json(result)

  } catch (error) {
    console.error("BALANCE ERROR:", error)

    return NextResponse.json(
      { error: "balance error" },
      { status: 500 }
    )
  }
}