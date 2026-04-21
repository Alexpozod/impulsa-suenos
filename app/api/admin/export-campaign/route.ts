import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Parser } from "json2csv"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       📦 LEDGER CAMPAÑA
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`
        *,
        campaigns (
          title
        )
      `)
      .eq("campaign_id", campaign_id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: true })

    if (error) throw error

    if (!ledger || ledger.length === 0) {
      return NextResponse.json(
        { error: "no data" },
        { status: 404 }
      )
    }

    /* =========================
       🔥 FILTRO SOLO USUARIO
    ========================= */
    const filteredLedger = ledger.filter((l: any) =>
      l.type === "payment" ||
      l.type === "withdraw" ||
      l.type === "fee_mp" ||
      l.type === "fee_platform"
    )

    const campaignName =
      filteredLedger[0]?.campaigns?.title || campaign_id

    /* =========================
       🧠 LABELS PRO
    ========================= */
    const getLabel = (type: string) => {
      switch (type) {
        case "payment": return "Donación"
        case "withdraw": return "Retiro"
        case "fee_mp": return "Comisión MercadoPago"
        case "fee_platform": return "Comisión Plataforma"
        default: return type
      }
    }

    const getDescription = (type: string) => {
      switch (type) {
        case "payment": return "Ingreso por donación"
        case "withdraw": return "Retiro aprobado"
        case "fee_mp": return "Costo de procesamiento de pago"
        case "fee_platform": return "Comisión de ImpulsaSueños"
        default: return type
      }
    }

    /* =========================
       💰 BALANCE PROGRESIVO
    ========================= */
    let runningBalance = 0

    const rows = filteredLedger.map((l: any) => {

      const amount = Number(l.amount || 0)

      let debe = 0
      let haber = 0

      if (amount > 0) {
        debe = amount
        runningBalance += amount
      } else {
        haber = Math.abs(amount)
        runningBalance -= Math.abs(amount)
      }

      return {
        Campaña: campaignName,
        Fecha: new Date(l.created_at).toLocaleDateString("es-CL"),
        Tipo: getLabel(l.type),
        Descripción: getDescription(l.type),
        Debe: debe,
        Haber: haber,
        Balance: runningBalance,
        Usuario: l.user_email,
        Moneda: "CLP"
      }
    })

    /* =========================
       📊 RESUMEN PRO
    ========================= */
    const totalIngresos = rows.reduce((acc, r) => acc + (Number(r.Debe) || 0), 0)
    const totalEgresos = rows.reduce((acc, r) => acc + (Number(r.Haber) || 0), 0)
    const balanceFinal = totalIngresos - totalEgresos

    const resumen = [
      {
        Campaña: campaignName,
        Fecha: "",
        Tipo: "RESUMEN",
        Descripción: `Ingresos: ${totalIngresos} | Egresos: ${totalEgresos} | Balance: ${balanceFinal}`,
        Debe: "",
        Haber: "",
        Balance: "",
        Usuario: "",
        Moneda: "CLP"
      }
    ]

    /* =========================
       📄 CSV FINAL
    ========================= */
    const parser = new Parser()
    const csv = parser.parse([...resumen, ...rows])

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=campaign_${campaign_id}.csv`
      }
    })

  } catch (error) {

    console.error("❌ EXPORT CAMPAIGN ERROR:", error)

    return NextResponse.json(
      { error: "export campaign error" },
      { status: 500 }
    )
  }
}