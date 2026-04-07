import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTicketEmail({
  to,
  ticket,
  campaign,
  amount
}: {
  to: string
  ticket: string
  campaign: string
  amount: number
}) {

  try {

    await resend.emails.send({
      from: 'ImpulsaSueños <contacto@impulsasuenos.com>',
      to,
      subject: `🎟️ Confirmación de donación - ${campaign}`,
      html: `
        <div style="font-family: Arial; padding:20px">

          <h2>✅ Donación confirmada</h2>

          <p>Gracias por apoyar la campaña:</p>
          <h3>${campaign}</h3>

          <p><b>Monto:</b> $${amount.toLocaleString()}</p>

          <hr/>

          <h3>🎟️ Tu ticket</h3>

          <div style="
            font-size:22px;
            font-weight:bold;
            background:#f3f4f6;
            padding:10px;
            border-radius:8px;
            display:inline-block;
          ">
            ${ticket}
          </div>

          <p style="margin-top:20px">
            Guarda este código como comprobante de tu donación.
          </p>

        </div>
      `
    })

  } catch (error) {
    console.log("❌ ERROR EMAIL:", error)
  }
}