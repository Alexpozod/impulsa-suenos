import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import path from "path"
import fs from "fs"

// @ts-ignore
import PDFDocument from "pdfkit"

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
       🔐 VALIDAR FUENTE
    ========================= */
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/Inter-Regular.ttf"
    )

    if (!fs.existsSync(fontPath)) {
      throw new Error("Fuente no encontrada en /public/fonts/Inter-Regular.ttf")
    }

    /* =========================
       📄 PDF
    ========================= */
    const doc = new PDFDocument({ margin: 40 })

    // 🔥 FIX DEFINITIVO Helvetica
    doc.registerFont("custom", fontPath)
    doc.font("custom")

    const chunks: Uint8Array[] = []

    doc.on("data", (chunk: Uint8Array) => {
      chunks.push(chunk)
    })

    const pdfBufferPromise = new Promise<Uint8Array>((resolve, reject) => {
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })

      doc.on("error", reject)
    })

    /* =========================
       ✍️ CONTENIDO
    ========================= */
    doc.fontSize(18).text("ImpulsaSueños", { align: "center" })
    doc.moveDown()

    doc.fontSize(14).text("Reporte Financiero de Campaña", {
      align: "center"
    })

    doc.moveDown(0.5)
    doc.fontSize(12).text(campaignName, { align: "center" })

    doc.moveDown(2)

    let totalIn = 0
    let totalOut = 0
    let balance = 0

    doc.fontSize(10)

    filtered.forEach((l: any) => {
      const amount = Number(l.amount || 0)

      if (amount > 0) {
        totalIn += amount
        balance += amount
      } else {
        totalOut += Math.abs(amount)
        balance -= Math.abs(amount)
      }

      const sign = amount > 0 ? "+" : "-"
      const formatted = `${sign} $${Math.abs(amount).toLocaleString("es-CL")}`

      doc.text(
        `${new Date(l.created_at).toLocaleDateString("es-CL")} | ${getLabel(l.type)} | ${formatted}`
      )
    })

    doc.moveDown(2)

    /* =========================
       📊 RESUMEN FINAL
    ========================= */
    doc.fontSize(12).text("Resumen:", { underline: true })

    doc.moveDown(0.5)
    doc.text(`Total Recaudado: $${totalIn.toLocaleString("es-CL")}`)
    doc.text(`Total Comisiones + Retiros: $${totalOut.toLocaleString("es-CL")}`)
    doc.text(`Balance Final Entregado: $${balance.toLocaleString("es-CL")}`, {
      align: "right"
    })

    doc.moveDown(2)

    doc.fontSize(9).text(
      "Documento generado automáticamente por ImpulsaSueños para fines de transparencia.",
      { align: "center" }
    )

    doc.end()

    /* =========================
       📦 RESPONSE
    ========================= */
    const pdfBuffer = await pdfBufferPromise

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=campaña_${campaignName}.pdf`
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