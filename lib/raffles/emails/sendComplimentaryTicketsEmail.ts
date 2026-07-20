import { Resend }
from "resend"

const resend =
  new Resend(
    process.env.RESEND_API_KEY
  )

interface SendComplimentaryTicketsEmailParams {

  email: string

  buyerName: string

  raffleTitle: string

  tickets: {
    ticket_code: string
  }[]

  campaignName?: string | null

  reason?: string | null

}

export async function
sendComplimentaryTicketsEmail({

  email,

  buyerName,

  raffleTitle,

  tickets,

  campaignName,

  reason

}: SendComplimentaryTicketsEmailParams) {

  const ticketList =
    tickets
      .map(
        ticket =>
          `<li style="margin-bottom:8px;">${ticket.ticket_code}</li>`
      )
      .join("")

  const campaignBlock =
    campaignName
      ? `
        <div style="
          margin-top:24px;
          padding:16px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:12px;
        ">
          <strong style="color:#0f172a;">
            Promoción:
          </strong>

          <span style="color:#475569;">
            ${campaignName}
          </span>
        </div>
      `
      : ""

  const reasonBlock =
    reason
      ? `
        <div style="
          margin-top:14px;
          padding:16px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:12px;
        ">
          <strong style="color:#0f172a;">
            Motivo:
          </strong>

          <span style="color:#475569;">
            ${reason}
          </span>
        </div>
      `
      : ""

  const {
    data,
    error
  } =
    await resend.emails.send({

      from:
        "ImpulsaSueños <tickets@impulsasuenos.com>",

      to:
        email,

      subject:
        `🎁 Tus participaciones fueron asignadas - ${raffleTitle}`,

      html: `
        <div style="
          background:#f4f7fb;
          padding:40px 20px;
          font-family:Arial,sans-serif;
        ">

          <div style="
            max-width:700px;
            margin:0 auto;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          ">

            <div style="
              background:#020617;
              padding:40px;
              text-align:center;
            ">

              <div style="
                font-size:34px;
                font-weight:bold;
                color:#ffffff;
              ">
                🎟️ ImpulsaSueños
              </div>

              <div style="
                margin-top:8px;
                font-size:18px;
                color:#22d3ee;
                font-weight:bold;
              ">
                SORTEOS
              </div>

              <div style="
                margin-top:18px;
                color:#94a3b8;
                font-size:16px;
              ">
                Recibiste participaciones promocionales
              </div>

            </div>

            <div style="padding:35px;">

              <h2 style="
                margin:0;
                color:#111827;
                font-size:28px;
              ">
                🎁 ¡Hola, ${buyerName}!
              </h2>

              <p style="
                margin-top:20px;
                color:#4b5563;
                font-size:16px;
                line-height:1.7;
              ">
                ImpulsaSueños te ha asignado participaciones gratuitas para el sorteo
                <strong>${raffleTitle}</strong>.
              </p>

              <p style="
                color:#4b5563;
                font-size:16px;
                line-height:1.7;
              ">
                Esta asignación no corresponde a una compra ni requiere ningún pago.
                Tus números ya fueron registrados oficialmente en el inventario del sorteo.
              </p>

              ${campaignBlock}

              ${reasonBlock}

              <div style="
                margin-top:30px;
                padding:20px;
                background:#ecfeff;
                border-radius:12px;
                border:1px solid #a5f3fc;
              ">

                <div style="
                  font-size:18px;
                  font-weight:bold;
                  color:#164e63;
                  margin-bottom:12px;
                ">
                  🎟️ Tus participaciones
                </div>

                <ul style="
                  padding-left:22px;
                  color:#0369a1;
                  font-size:18px;
                  line-height:1.9;
                ">
                  ${ticketList}
                </ul>

              </div>

              <div style="
                margin-top:30px;
                padding:18px;
                background:#f0fdf4;
                border-left:5px solid #16a34a;
                border-radius:10px;
                color:#166534;
                line-height:1.7;
              ">
                ✅ Tus participaciones fueron asignadas correctamente.<br>
                ✅ Los números forman parte del inventario real del sorteo.<br>
                ✅ Conserva este correo como respaldo de la asignación.<br>
                ✅ Los resultados serán publicados en ImpulsaSueños Sorteos.
              </div>

              <div style="
                margin-top:35px;
                text-align:center;
              ">

                <a
                  href="https://sorteos.impulsasuenos.com"
                  style="
                    display:inline-block;
                    background:#0891b2;
                    color:#ffffff;
                    text-decoration:none;
                    padding:16px 34px;
                    border-radius:12px;
                    font-size:18px;
                    font-weight:bold;
                  "
                >
                  Ver mis participaciones
                </a>

              </div>

              <hr style="
                margin:40px 0;
                border:none;
                border-top:1px solid #e5e7eb;
              ">

              <div style="
                font-size:13px;
                color:#6b7280;
                line-height:1.8;
                text-align:center;
              ">
                ImpulsaSueños Sorteos<br><br>

                Este correo confirma una asignación promocional de participaciones.<br>

                No corresponde a una compra, cobro ni transacción financiera.<br><br>

                Si necesitas ayuda, contáctanos mediante nuestros canales oficiales.
              </div>

            </div>

          </div>

        </div>
      `
    })

  if (error) {

    console.error(
      "send complimentary tickets email error",
      error
    )

    throw new Error(
      "complimentary_email_failed"
    )
  }

  return data
}