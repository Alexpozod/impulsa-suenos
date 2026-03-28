import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTicketEmail({
  to,
  tickets,
  campaign
}: {
  to: string
  tickets: number[]
  campaign: string
}) {

  await resend.emails.send({
    from: 'ImpulsaSueños <contacto@impulsasuenos.com>',
    to,
    subject: `🎟️ Tus tickets - ${campaign}`,
    html: `
      <h2>¡Compra confirmada!</h2>

      <p>Gracias por participar en <b>${campaign}</b></p>

      <p><b>Tus tickets:</b></p>

      <ul>
        ${tickets.map(t => `<li>🎟️ Ticket #${t}</li>`).join('')}
      </ul>

      <p>¡Mucha suerte! 🍀</p>
    `
  })
}
