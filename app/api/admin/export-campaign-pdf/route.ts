import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
       📦 DATA
    ========================= */
    const { data: ledger, error } = await supabase
      .from("financial_ledger")
      .select(`*, campaigns(title)`)
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
       🔥 FILTRO USUARIO
    ========================= */
    const filtered = ledger.filter((l: any) =>
      ["payment", "withdraw", "fee_mp", "fee_platform"].includes(l.type)
    )

    const campaignName =
      filtered[0]?.campaigns?.title || campaign_id

    /* =========================
       📊 CALCULO
    ========================= */
    let totalIn = 0
    let totalOut = 0
    let balance = 0

    const rows = filtered.map((l: any) => {
      const amount = Number(l.amount || 0)

      if (amount > 0) {
        totalIn += amount
        balance += amount
      } else {
        totalOut += Math.abs(amount)
        balance -= Math.abs(amount)
      }

      return `
        <tr>
          <td>${new Date(l.created_at).toLocaleDateString("es-CL")}</td>
          <td>${l.type}</td>
          <td>${amount > 0 ? "+" : "-"} $${Math.abs(amount).toLocaleString("es-CL")}</td>
        </tr>
      `
    }).join("")

    /* =========================
       📄 HTML (PDF READY)
    ========================= */
    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Reporte</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1, h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            .summary { margin-top: 30px; }
          </style>
        </head>
        <body>

          <h1>ImpulsaSueños</h1>
          <h2>${campaignName}</h2>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="summary">
            <p><strong>Total Recaudado:</strong> $${totalIn.toLocaleString("es-CL")}</p>
            <p><strong>Total Descuentos:</strong> $${totalOut.toLocaleString("es-CL")}</p>
            <p><strong>Balance Final:</strong> $${balance.toLocaleString("es-CL")}</p>
          </div>

          <p style="margin-top:40px; text-align:center; font-size:12px;">
            Documento generado automáticamente por ImpulsaSueños
          </p>

        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename=campaña_${campaignName}.html`
      }
    })

  } catch (error: any) {

    console.error("❌ EXPORT ERROR:", error)

    return NextResponse.json(
      { error: error?.message || "export error" },
      { status: 500 }
    )
  }
}