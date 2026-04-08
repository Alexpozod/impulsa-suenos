import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDonationEmail({
  to,
  campaign,
  amount
}: {
  to: string
  campaign: string
  amount: number
}) {
  try {
    await resend.emails.send({
      from: 'ImpulsaSueños <contacto@impulsasuenos.com>',
      to,
      subject: `💖 Gracias por tu donación`,
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>💖 Gracias por tu apoyo</h2>

          <p>Has donado a:</p>
          <h3>${campaign}</h3>

          <p><b>Monto:</b> $${amount.toLocaleString()}</p>

          <hr/>

          <p>Tu aporte está ayudando a cambiar una vida.</p>

          <p>Gracias por ser parte 🙌</p>
        </div>
      `
    })
  } catch (error) {
    console.log("❌ ERROR EMAIL:", error)
  }
}