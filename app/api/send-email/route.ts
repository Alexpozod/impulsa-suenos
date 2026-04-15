import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {

    const body = await req.json()

    /* =========================
       💖 DONACIÓN (LEGACY)
    ========================= */
    if (body.email && body.amount !== undefined && body.campaign) {

      const { email, amount, campaign } = body

      const response = await resend.emails.send({
        from: "Impulsa Sueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "💖 Donación confirmada - ImpulsaSueños",
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <h2>🎉 ¡Gracias por tu aporte!</h2>
            
            <p>Tu donación fue realizada correctamente en <strong>ImpulsaSueños</strong></p>
            
            <p><strong>Campaña:</strong> ${campaign}</p>
            
            <p><strong>Monto donado:</strong></p>
            <p style="font-size:18px; font-weight:bold; color:green;">
              $${Number(amount).toLocaleString()}
            </p>

            <hr/>

            <p style="font-size:12px; color:gray;">
              Este correo es tu comprobante de donación.
            </p>
          </div>
        `,
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔔 EMAIL GENÉRICO (KYC, etc)
    ========================= */
    if (body.to && body.subject && body.html) {

      const { to, subject, html } = body

      const response = await resend.emails.send({
        from: "Impulsa Sueños <contacto@impulsasuenos.com>",
        to,
        subject,
        html
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       ❌ ERROR
    ========================= */
    return NextResponse.json(
      { error: "Formato inválido" },
      { status: 400 }
    )

  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}