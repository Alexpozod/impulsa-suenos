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
      .select("campaign_id, type, amount")

    if (!ledger) {
      return NextResponse.json([])
    }

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

      if (l.type === "withdraw") {
        map[l.campaign_id].withdrawn += Math.abs(Number(l.amount || 0))
      }

      if (l.type === "fee_platform") {
        map[l.campaign_id].fees += Math.abs(Number(l.amount || 0))
      }
    }

    const result = Object.entries(map).map(([campaign_id, val]: any) => ({
      campaign_id,
      income: val.income,
      withdrawn: val.withdrawn,
      fees: val.fees,
      balance: val.income - val.withdrawn - val.fees
    }))

    return NextResponse.json(result)

  } catch (error) {
    console.error(error)
    return NextResponse.json([])
  }
}