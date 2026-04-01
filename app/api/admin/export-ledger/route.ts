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
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "error fetching ledger" },
        { status: 500 }
      )
    }

    const parser = new Parser()
    const csv = parser.parse(data)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=ledger.csv"
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "export error" },
      { status: 500 }
    )
  }
}
