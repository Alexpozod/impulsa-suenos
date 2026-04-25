import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json([], { status: 200 })
    }

    /* =========================
       🔥 1. TRAER LEDGER
    ========================= */
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select(`
        amount,
        payment_id,
        metadata
      `)
      .eq("type", "payment")
      .eq("status", "confirmed")
      .eq("campaign_id", campaign_id)

    if (!ledger || ledger.length === 0) {
      return NextResponse.json([])
    }

    /* =========================
       🔥 2. TRAER PAYMENTS
    ========================= */
    const paymentIds = ledger.map(l => l.payment_id)

    const { data: payments } = await supabase
      .from("payments")
      .select("payment_id, metadata")
      .in("payment_id", paymentIds)

    const paymentsMap = (payments || []).reduce((acc, p) => {
      acc[p.payment_id] = p.metadata
      return acc
    }, {} as any)

    /* =========================
       🧠 3. AGRUPAR DONADORES
    ========================= */
    const donors: Record<string, { name: string; total: number }> = {}

    for (const row of ledger) {

      const paymentMeta = paymentsMap[row.payment_id] || {}

      const donorName =
        row.metadata?.donor_name ||
        paymentMeta?.donor_name ||
        paymentMeta?.payer_name ||
        "Donador"

      if (!donors[donorName]) {
        donors[donorName] = {
          name: donorName,
          total: 0
        }
      }

      donors[donorName].total += Number(row.amount || 0)
    }

    /* =========================
       🏆 4. ORDENAR TOP
    ========================= */
    const ranking = Object.values(donors)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return NextResponse.json(ranking)

  } catch (error) {
    console.error("Ranking error:", error)
    return NextResponse.json([], { status: 200 })
  }
}