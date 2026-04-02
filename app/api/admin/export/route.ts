import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Parser } from "json2csv"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const { data } = await supabase
    .from("financial_ledger")
    .select("*")
    .order("created_at", { ascending: false })

  const parser = new Parser()

  const csv = parser.parse(data)

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=contabilidad.csv",
    },
  })
}