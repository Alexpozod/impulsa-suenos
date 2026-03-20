import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { email, tickets, campaign } = await req.json()

    if (!email || !tickets || tickets.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const ticketNumbers = tickets.map((t: any) => `#${t.ticket_number}`).join(", ")

    const response = await resend.emails.send({
      from: "ImpulsaSueños <onboarding@resend.dev>",
      to: email,
      subject: "🎟️ Tus tickets - ImpulsaSueños",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>🎉 ¡Compra exitosa!</h2>
          
          <p>Gracias por participar en <strong>ImpulsaSueños</strong></p>
          
          <p><strong>Campaña:</strong> ${campaign}</p>
          
          <p><strong>Tus tickets:</strong></p>
          <p style="font-size:18px; font-weight:bold;">
            ${ticketNumbers}
          </p>

          <hr/>

          <p style="font-size:12px; color:gray;">
            Guarda este correo como comprobante de participación.
          </p>
        </div>
      `,
    })

    console.log("📧 Email enviado:", response)

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR EMAIL:", error)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}
