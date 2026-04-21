import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const PDFDocument = require("pdfkit")

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
       🧠 HELPERS
    ========================= */
    const getLabel = (type: string) => {
      switch (type) {
        case "payment": return "Donación"
        case "withdraw": return "Retiro"
        case "fee_mp": return "Comisión MP"
        case "fee_platform": return "Comisión Plataforma"
        default: return type
      }
    }

    /* =========================
       📄 PDF (FIX PRO)
    ========================= */
    const doc = new PDFDocument({ margin: 40 })

    const buffers: Uint8Array[] = []

    doc.on("data", (chunk: Uint8Array) => buffers.push(chunk))

    const pdfPromise = new Promise<Uint8Array>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(buffers))
      })
      doc.on("error", reject)
    })

    /* =========================
       ✍️ CONTENIDO PDF
    ========================= */
    doc.fontSize(18).text("ImpulsaSueños", { align: "center" })
    doc.moveDown()

    doc.fontSize(14).text("Reporte de Campaña", { align: "center" })
    doc.text(campaignName, { align: "center" })

    doc.moveDown(2)

    let balance = 0

    doc.fontSize(10)

    filtered.forEach((l: any) => {
      const amount = Number(l.amount || 0)

      let line = ""

      if (amount > 0) {
        balance += amount
        line = `+ $${amount}`
      } else {
        balance -= Math.abs(amount)
        line = `- $${Math.abs(amount)}`
      }

      doc.text(
        `${new Date(l.created_at).toLocaleDateString("es-CL")} | ${getLabel(l.type)} | ${line} | Balance: $${balance}`
      )
    })

    doc.moveDown(2)

    doc.fontSize(12).text(`Balance Final: $${balance}`, {
      align: "right"
    })

    doc.end()

    /* =========================
       📦 OUTPUT (FIX CLAVE)
    ========================= */
    const pdfBuffer = await pdfPromise

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=campaign_${campaign_id}.pdf`
      }
    })

  } catch (error: any) {

    console.error("❌ PDF ERROR REAL:", error)

    return NextResponse.json(
      { error: error?.message || "pdf error" },
      { status: 500 }
    )
  }
}