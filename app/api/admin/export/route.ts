import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Parser } from "json2csv"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data, error } = await supabase
      .from("financial_ledger")
      .select(`
        *,
        campaigns (
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const rows = (data || []).map((l: any) => {

      const amount = Number(l.amount || 0)

      return {
        Fecha: l.accounting_date || l.created_at,
        Tipo: l.type,
        Flow: l.flow_type,

        // ✅ FIX: nombre campaña (fallback seguro)
        Campaña: l.campaigns?.title || l.campaign_id,

        Usuario: l.user_email,

        Debe: amount > 0 ? amount : 0,
        Haber: amount < 0 ? Math.abs(amount) : 0,

        // ✅ FIX: moneda SIEMPRE CLP
        Moneda: "CLP",

        Proveedor: l.provider || "mercadopago",
        PaymentID: l.payment_id,

        // 🔥 mejora: descripción más útil (sin romper nada)
        Descripción: `${l.type} (${l.flow_type})`
      }
    })

    const parser = new Parser()
    const csv = parser.parse(rows)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=impulsasuenos_contabilidad.csv"
      }
    })

  } catch (error) {

    console.error("❌ EXPORT ERROR:", error)

    return NextResponse.json(
      { error: "export error" },
      { status: 500 }
    )
  }
}