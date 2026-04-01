import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: ledger } = await supabase
      .from("financial_ledger")
      .select("*")

    const { data: payments } = await supabase
      .from("processed_payments")
      .select("*")

    const ledgerIds = new Set(
      ledger?.map(l => l.payment_id).filter(Boolean)
    )

    const missingInLedger = payments?.filter(
      p => !ledgerIds.has(p.payment_id)
    )

    return NextResponse.json({
      ok: true,
      total_ledger: ledger?.length || 0,
      total_payments: payments?.length || 0,
      missing_in_ledger: missingInLedger || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: "reconcile error" },
      { status: 500 }
    )
  }
}
