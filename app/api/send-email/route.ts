import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {

    const body = await req.json()

    /* =========================
       🚀 WELCOME EMAIL
    ========================= */
    if (body.type === "welcome" && body.email && body.source === "callback") {
      
      const { email } = body

      await resend.emails.send({
        from: "Impulsa Sueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "Bienvenido a ImpulsaSueños 🚀",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:40px 20px;">
            <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:40px;">
              <h1 style="color:#16a34a;">ImpulsaSueños</h1>
              <h2>Bienvenido 🚀</h2>
              <p>Tu cuenta ya está activa.</p>
              <p>Ahora puedes crear campañas y generar impacto real.</p>

              <div style="text-align:center; margin:30px 0;">
                <a href="https://impulsasuenos.com/dashboard"
                  style="padding:14px 28px;background:#16a34a;color:white;border-radius:10px;text-decoration:none;font-weight:bold;">
                  Ir a mi panel
                </a>
              </div>

              <p style="text-align:center;">💚 Gracias por ser parte del cambio</p>
            </div>
          </div>
        `
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔐 RECOVER PASSWORD (NUEVO 🔥)
    ========================= */
    if (body.type === "recover" && body.email && body.link) {

      const { email, link } = body

      await resend.emails.send({
        from: "Impulsa Sueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "🔐 Recupera tu contraseña",
        html: `
          <div style="font-family: Arial; padding:20px; max-width:600px; margin:auto;">

            <h2 style="color:#16a34a;">🔐 Recuperación de contraseña</h2>

            <p>Recibimos una solicitud para restablecer tu contraseña.</p>

            <div style="text-align:center; margin:25px 0;">
              <a href="${link}"
                style="background:#16a34a; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
                Restablecer contraseña
              </a>
            </div>

            <p style="font-size:13px; color:#666;">
              Si no solicitaste este cambio, ignora este correo.
            </p>

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
            <p><strong>Campaña:</strong> ${campaign}</p>
            <p><strong>Monto:</strong> $${Number(amount).toLocaleString()}</p>
          </div>
        `,
      })

      return NextResponse.json({ ok: true })
    }

    /* =========================
       🔔 EMAIL GENÉRICO
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

    return NextResponse.json(
      { error: "Formato inválido" },
      { status: 400 }
    )

  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}