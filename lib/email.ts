import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

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
      throw new Error("RESEND_API_KEY NO DEFINIDA")
    }

    const response = await resend.emails.send({
      from: 'ImpulsaSueños <contacto@impulsasuenos.com>',
      to,
      subject: `💚 Tu donación está haciendo la diferencia`,
      html: `
        <div style="font-family: Arial; padding:20px; max-width:600px; margin:auto; background:#f4f4f5">

          <div style="background:white; padding:25px; border-radius:12px">

            <h2 style="color:#16a34a;">💚 Gracias por tu apoyo</h2>

            <p>Tu donación fue realizada con éxito 🙌</p>

            <div style="background:#f9fafb; padding:15px; border-radius:10px; margin-top:15px">
              <p><b>Campaña:</b></p>
              <h3 style="margin:5px 0">${campaign}</h3>

              <p><b>Monto donado:</b> $${amount.toLocaleString()}</p>
            </div>

            <p style="margin-top:20px; font-size:14px; color:#444">
              Tu aporte está ayudando directamente a cambiar una vida.
            </p>

            <div style="background:#ecfdf5; padding:15px; border-radius:10px; margin-top:20px">
              <p style="margin:0; font-weight:bold; color:#065f46;">
                🌍 No estás solo
              </p>
              <p style="font-size:13px; color:#065f46;">
                Más personas están apoyando esta causa ahora mismo.
              </p>
            </div>

            <div style="text-align:center; margin-top:25px">
              <a href="https://impulsasuenos.com/campaign"
                style="background:#16a34a; color:white; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:bold;">
                Compartir campaña
              </a>
            </div>

            <p style="margin-top:25px; font-size:13px; color:#666; text-align:center">
              Cada persona que comparte, multiplica el impacto 💚
            </p>

            <hr style="margin:20px 0"/>

            <p style="font-size:13px; color:#555">
              Gracias por confiar en <b>ImpulsaSueños</b> 💚
            </p>

          </div>

        </div>
      `
    })

    if (!response || response.error) {
      throw new Error(response?.error?.message || "Error enviando email")
    }

    console.log("📧 EMAIL ENVIADO:", response)

  } catch (error) {

    console.error("❌ ERROR EMAIL DONATION:", error)

    throw error // 🔥 CLAVE: PROPAGA EL ERROR
  }
}