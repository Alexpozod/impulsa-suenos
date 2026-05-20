import { Resend }
from "resend"

const resend =
  new Resend(
    process.env.RESEND_API_KEY
  )

export async function sendTicketsEmail({

  email,
  raffleTitle,
  tickets

}: {

  email: string

  raffleTitle: string

  tickets: any[]

}) {

  const list =
    tickets
      .map(
        t =>
          `<li>${t.ticket_code}</li>`
      )
      .join("")

  await resend.emails.send({

    from:
      "ImpulsaSueños <tickets@impulsasuenos.com>",

    to: email,

    subject:
      `🎟️ Tus tickets - ${raffleTitle}`,

    html: `

      <div
        style="
          font-family: Arial;
          padding: 20px;
        "
      >

        <h1>
          🎟️ Compra confirmada
        </h1>

        <p>
          Gracias por participar.
        </p>

        <p>
          Tus tickets:
        </p>

        <ul>
          ${list}
        </ul>

      </div>
    `
  })
}