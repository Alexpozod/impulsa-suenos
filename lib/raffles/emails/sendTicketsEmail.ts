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

<div style="background:#f4f7fb;padding:40px 20px;font-family:Arial,sans-serif;">

<div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">

<div style="background:#0f172a;padding:30px;text-align:center;">

<div style="font-size:34px;font-weight:bold;color:#ffffff;">
🚀 ImpulsaSueños
</div>

<div style="margin-top:10px;color:#cbd5e1;font-size:16px;">
Compra confirmada
</div>

</div>

<div style="padding:35px;">

<h2 style="margin:0;color:#111827;font-size:28px;">
🎉 ¡Tus tickets ya están listos!
</h2>

<p style="margin-top:20px;color:#4b5563;font-size:16px;line-height:1.7;">
Gracias por participar en
<strong>${raffleTitle}</strong>.
Tu pago fue confirmado correctamente y tus tickets quedaron registrados.
</p>

<div style="margin-top:30px;padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">

<div style="font-size:18px;font-weight:bold;color:#111827;margin-bottom:12px;">
🎟️ Tus tickets
</div>

<ul style="padding-left:22px;color:#2563eb;font-size:18px;line-height:1.9;">
${list}
</ul>

</div>

<div style="margin-top:30px;padding:18px;background:#ecfeff;border-left:5px solid #0891b2;border-radius:10px;color:#164e63;line-height:1.7;">

✅ Tu participación quedó registrada.<br>
✅ Conserva este correo como comprobante.<br>
✅ Los resultados del sorteo serán publicados en ImpulsaSueños.

</div>

<div style="margin-top:35px;text-align:center;">

<a
href="https://www.impulsasuenos.com/raffles"
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
Ver más sorteos
</a>

</div>

<hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;">

<div style="font-size:13px;color:#6b7280;line-height:1.8;text-align:center;">

ImpulsaSueños<br>

Este correo fue enviado automáticamente porque realizaste una compra en nuestra plataforma.<br><br>

Si necesitas ayuda puedes contactarnos mediante nuestros canales oficiales.

</div>

</div>

</div>

</div>

`
  })
}