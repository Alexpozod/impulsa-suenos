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

    if (!process.env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY NO DEFINIDA")
      return
    }

    const response = await resend.emails.send({
      from: 'ImpulsaSueños <contacto@impulsasuenos.com>', // ⚠️ dominio debe estar verificado en Resend
      to,
      subject: `💖 Gracias por tu donación`,
      html: `
        <div style="font-family: Arial; padding:20px; max-width:600px; margin:auto">

          <h2 style="color:#16a34a;">💖 Gracias por tu apoyo</h2>

          <p>Tu donación fue realizada con éxito 🙌</p>

          <div style="background:#f9fafb; padding:15px; border-radius:10px; margin-top:15px">
            <p><b>Campaña:</b></p>
            <h3 style="margin:5px 0">${campaign}</h3>

            <p><b>Monto donado:</b> $${amount.toLocaleString()}</p>
          </div>

          <hr style="margin:20px 0"/>

          <p style="font-size:14px; color:#555">
            Tu aporte está ayudando directamente a cambiar una vida.
          </p>

          <p style="margin-top:20px">
            Gracias por confiar en <b>ImpulsaSueños</b> 💚
          </p>

        </div>
      `
    })

    console.log("📧 EMAIL ENVIADO:", response)

  } catch (error) {
    console.log("❌ ERROR EMAIL:", error)
  }
}