import { Resend }
from "resend"

const resend =
  new Resend(
    process.env.RESEND_API_KEY
  )

export async function sendTicketsEmail({

  email,
  raffleTitle,
  tickets,
  digitalResources = []

}: {

  email: string

  raffleTitle: string

  tickets: any[]

  digitalResources?: {

    title: string

    description: string

    downloadUrl: string

    expiresInDays: number

  }[]

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
  `🎟️ Confirmación de participación - ${raffleTitle}`,

    html: `

<div style="background:#f4f7fb;padding:40px 20px;font-family:Arial,sans-serif;">

<div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">

<div style="background:#020617;padding:40px;text-align:center;">

<div style="font-size:34px;font-weight:bold;color:#ffffff;">
🎟️ ImpulsaSueños
</div>

<div style="margin-top:8px;font-size:18px;color:#22d3ee;font-weight:bold;">
SORTEOS
</div>

<div style="margin-top:18px;color:#94a3b8;font-size:16px;">
Tu participación fue confirmada correctamente
</div>

</div>

<div style="padding:35px;">

<h2 style="margin:0;color:#111827;font-size:28px;">
🎉 ¡Tu participación fue registrada!
</h2>

<p style="margin-top:20px;color:#4b5563;font-size:16px;line-height:1.7;">
Tu pago fue confirmado correctamente.

Ya puedes revisar tus participaciones del sorteo

<strong>${raffleTitle}</strong>.

A continuación encontrarás todos los números asignados a tu compra.
</p>

<div style="margin-top:30px;padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">

<div style="font-size:18px;font-weight:bold;color:#111827;margin-bottom:12px;">
🎟️ Tus participaciones
</div>

<ul style="padding-left:22px;color:#2563eb;font-size:18px;line-height:1.9;">
${list}
</ul>

</div>

<div style="margin-top:30px;padding:18px;background:#ecfeff;border-left:5px solid #0891b2;border-radius:10px;color:#164e63;line-height:1.7;">

✅ Pago confirmado.<br>
✅ Tus participaciones fueron asignadas correctamente.<br>
✅ Conserva este correo como comprobante oficial.<br>
✅ Los resultados serán publicados en ImpulsaSueños Sorteos.

</div>

${
digitalResources.length > 0
? `

<div style="margin-top:32px;padding:24px;background:#f8fafc;border:1px solid #dbeafe;border-radius:14px;">

<div style="font-size:22px;font-weight:bold;color:#111827;margin-bottom:10px;">
🎁 Tus recursos digitales
</div>

<p style="color:#475569;font-size:15px;line-height:1.7;margin-bottom:22px;">
Como agradecimiento por tu participación, hemos preparado estos recursos digitales para ti.
Los enlaces de descarga estarán disponibles durante <strong>7 días</strong>.
Te recomendamos descargar y guardar los archivos en tu dispositivo antes de que expire el período de acceso.
</p>

${digitalResources.map(resource => `

<div style="padding:16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:14px;">

<div style="font-size:18px;font-weight:bold;color:#0f172a;">
${resource.title}
</div>

<div style="margin-top:6px;color:#64748b;font-size:15px;line-height:1.6;">
${resource.description}
</div>

<div style="margin-top:18px;">

<a
href="${resource.downloadUrl}"
style="
display:inline-block;
background:#0891b2;
color:#ffffff;
text-decoration:none;
padding:12px 22px;
border-radius:10px;
font-weight:bold;
">
⬇ Descargar
</a>

</div>

</div>

`).join("")}

</div>

`
: ""
}

<div style="margin-top:35px;text-align:center;">

<a
href="https://sorteos.impulsasuenos.com"
style="
display:inline-block;
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:16px 34px;
border-radius:12px;
font-size:18px;
font-weight:bold;
">
Ir a Sorteos
</a>

</div>

<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">

<div style="font-size:13px;color:#6b7280;line-height:1.8;text-align:center;">

ImpulsaSueños Sorteos<br><br>

Este correo confirma oficialmente tu participación en el sorteo.<br>

Guárdalo como comprobante de compra y asignación de participaciones.<br><br>

Si necesitas ayuda, contáctanos mediante nuestros canales oficiales.

</div>

</div>

</div>

</div>

`
  })
}