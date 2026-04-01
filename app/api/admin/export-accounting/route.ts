import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function toCSV(rows: any[]) {
  if (!rows.length) return ""

  const headers = Object.keys(rows[0]).join(",")

  const values = rows.map(row =>
    Object.values(row)
      .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  )

  return [headers, ...values].join("\n")
}

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

    const rows = (data || []).map(row => {
      const bruto = Number(row.amount || 0)

      // 💸 comisión pasarela (MercadoPago 2.96%)
      const fee_pasarela = bruto * 0.0296

      // 🧾 comisión plataforma fija
      const fee_plataforma = 300

      // 🟢 neto real al creador
      const neto = bruto - fee_pasarela - fee_plataforma

      return {
        Fecha: new Date(row.created_at).toISOString(),
        Tipo: row.type,
        Monto_Bruto: bruto,
        Fee_Pasarela: Math.round(fee_pasarela),
        Fee_Plataforma: fee_plataforma,
        Neto_Usuario: Math.round(neto),
        Moneda: row.currency || "CLP",
        Organizacion: row.organization_id || "",
        Campaña: row.campaign_id,
        Referencia: row.payment_id,
        Proveedor: row.provider || "mercadopago"
      }
    })

    const csv = toCSV(rows)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=contabilidad_impulsasuenos.csv"
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
