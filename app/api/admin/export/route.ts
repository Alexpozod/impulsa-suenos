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

    if (error) throw error

    const safeData = data || []

    /* 🧾 FORMATO CONTABLE */
    const formatted = safeData.map((l: any) => ({
      fecha: l.accounting_date || l.created_at,
      tipo: l.flow_type,
      campaña: l.campaign_id,
      usuario: l.user_email,
      debe: l.amount > 0 ? Number(l.amount) : 0,
      haber: l.amount < 0 ? Math.abs(Number(l.amount)) : 0,
      descripcion: l.flow_type,
      proveedor: l.provider || "",
    }))

    const parser = new Parser()
    const csv = parser.parse(formatted)

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