import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {

    const body = await req.json()

    /* =========================
       🚀 WELCOME EMAIL
    ========================= */
    if (body.type === "welcome" && body.email) {

      const { email } = body

      await resend.emails.send({
        from: "Impulsa Sueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "Bienvenido a ImpulsaSueños 🚀",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:40px 20px;">

            <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.05);">

              <h1 style="color:#16a34a;">ImpulsaSueños</h1>

              <h2 style="color:#111;">Bienvenido 🚀</h2>

              <p style="color:#444; font-size:16px;">
                Tu cuenta ya está activa.
              </p>

              <p style="color:#444; font-size:16px;">
                Ahora puedes crear campañas, apoyar causas y generar impacto real.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="https://impulsasuenos.com/dashboard"
                  style="display:inline-block;padding:14px 28px;background:#16a34a;color:white;border-radius:10px;text-decoration:none;font-weight:bold;">
                  Ir a mi panel
                </a>
              </div>

              <p style="text-align:center; color:#666; font-size:14px;">
                💚 Gracias por ser parte del cambio
              </p>

            </div>

          </div>
        `
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       💖 DONACIÓN (LEGACY)
    ========================= */
    if (body.email && body.amount !== undefined && body.campaign) {

      const { email, amount, campaign } = body

      await resend.emails.send({
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

      await resend.emails.send({
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