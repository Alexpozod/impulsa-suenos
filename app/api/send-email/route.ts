import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { email, tickets, campaign } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: "ImpulsaSueños <onboarding@resend.dev>",
      to: email,
      subject: "🎟️ Compra confirmada - ImpulsaSueños",
      html: `
        <h2>¡Gracias por participar!</h2>

        <p>Tu compra fue confirmada correctamente.</p>

        <p><strong>Campaña:</strong> ${campaign}</p>

        <p><strong>Tus tickets:</strong></p>

        <ul>
          ${(tickets || [])
            .map((t: any) => `<li>#${t.ticket_number}</li>`)
            .join("")}
        </ul>

        <p>Mucha suerte 🍀</p>
      `,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR EMAIL:", error)

    return NextResponse.json(
      { error: "Error enviando email" },
      { status: 500 }
    )
  }
}
