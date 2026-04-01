import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Parser } from "json2csv"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("financial_ledger")
      .select("*")

    if (error) {
      return NextResponse.json(
        { error: "error fetching ledger" },
        { status: 500 }
      )
    }

    const formatted = (data || []).map(row => ({
      Fecha: row.created_at,
      Tipo: row.type,
      Monto_Bruto: row.amount,
      Comisión: row.fee,
      Neto: row.net_amount,
      Moneda: row.currency,
      Campaña: row.campaign_id,
      Referencia: row.payment_id
    }))

    const parser = new Parser()
    const csv = parser.parse(formatted)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=accounting.csv"
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "export error" },
      { status: 500 }
    )
  }
}
