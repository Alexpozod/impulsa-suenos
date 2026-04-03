import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

const ADMIN_EMAIL = "contacto@impulsasuenos.com"

type AlertPayload = {
  title: string
  message: string
  data?: any
}

export async function sendAlert({
  title,
  message,
  data
}: AlertPayload) {
  try {
    await resend.emails.send({
      from: "alertas@impulsasuenos.com",
      to: ADMIN_EMAIL,
      subject: `🚨 ${title}`,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        <pre style="background:#111;color:#0f0;padding:10px;border-radius:6px;">
${JSON.stringify(data || {}, null, 2)}
        </pre>
      `,
    })
  } catch (error) {
    console.error("❌ Error enviando alerta:", error)
  }
}