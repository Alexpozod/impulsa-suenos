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
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        id,
        amount,
        created_at,
        campaign_id,
        metadata,
        payment_id
      `)
      .eq("type", "payment")
      .eq("status", "confirmed")
      .eq("campaign_id", campaign_id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Ledger error:", error)
      return NextResponse.json([], { status: 200 })
    }

    /* =========================
       🔥 2. TRAER PAYMENTS
    ========================= */
    const paymentIds = (ledger || []).map(l => l.payment_id).filter(Boolean)

    let paymentsMap: Record<string, any> = {}

    if (paymentIds.length > 0) {
      const { data: payments } = await supabase
        .from("payments")
        .select("payment_id, metadata")
        .in("payment_id", paymentIds)

      paymentsMap = (payments || []).reduce((acc, p) => {
        acc[p.payment_id] = p.metadata
        return acc
      }, {} as any)
    }

    /* =========================
       🔥 3. NORMALIZACIÓN FINAL
    ========================= */
    const safe = (ledger || []).map((d) => {

      const paymentMeta = paymentsMap[d.payment_id] || {}

      const donorName =
        d.metadata?.donor_name ||
        paymentMeta?.donor_name ||
        paymentMeta?.payer_name ||
        null

      return {
        id: d.id,
        amount: d.amount,
        created_at: d.created_at,
        campaign_id: d.campaign_id,

        metadata: {
          donor_name: donorName,
          message:
            d.metadata?.message ||
            paymentMeta?.message ||
            ""
        },

        payment_id: d.payment_id
      }
    })

    return NextResponse.json(safe)

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json([], { status: 200 })
  }
}