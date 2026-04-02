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
      throw error
    }

    // 🔥 FIX CRÍTICO
    const safeData = data || []

    const parser = new Parser()

    const csv = parser.parse(safeData)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=contabilidad.csv",
      },
    })

  } catch (error) {
    console.error("EXPORT ERROR:", error)

    return NextResponse.json(
      { error: "Error exportando datos" },
      { status: 500 }
    )
  }
}