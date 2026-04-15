import { createClient } from "@supabase/supabase-js"
import { sendDonationEmail } from "@/lib/email"
import { logSystemEvent } from "@/lib/system/logger"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type NotificationParams = {
  user_email: string
  type: string
  title: string
  message: string
  metadata?: any
  sendEmail?: boolean
}

export async function sendNotification({
  user_email,
  type,
  title,
  message,
  metadata = {},
  sendEmail = false
}: NotificationParams) {

  try {

    /* =========================
       💾 GUARDAR EN BD
    ========================= */
    await supabase.from("notifications").insert({
      user_email,
      type,
      title,
      message,
      metadata,
      read: false,
      created_at: new Date().toISOString()
    })

    /* =========================
       📧 EMAIL SEGÚN TIPO
    ========================= */
    if (sendEmail) {

      try {

        // 💖 DONACIÓN (NO TOCAR)
        if (type === "donation") {
          await sendDonationEmail({
            to: user_email,
            campaign: title,
            amount: metadata?.amount || 0
          })
        }

        // ✅ KYC APROBADO
        else if (type === "kyc_approved") {
          await sendSimpleEmail({
            to: user_email,
            subject: "✅ Verificación aprobada",
            html: `
              <h2>Tu identidad fue verificada</h2>
              <p>Ya puedes crear campañas y retirar fondos.</p>
              <br/>
              <p>Gracias por confiar en ImpulsaSueños 💚</p>
            `
          })
        }

        // ❌ KYC RECHAZADO
        else if (type === "kyc_rejected") {
          await sendSimpleEmail({
            to: user_email,
            subject: "❌ Verificación rechazada",
            html: `
              <h2>Tu verificación fue rechazada</h2>
              <p>Revisa los documentos enviados y vuelve a intentarlo.</p>
            `
          })
        }

      } catch (err) {

        await logSystemEvent({
          type: "notification_email_error",
          severity: "warning",
          message: "Error enviando email",
          metadata: { user_email, type }
        })

      }

    }

  } catch (error) {

    await logSystemEvent({
      type: "notification_error",
      severity: "warning",
      message: "Error creando notificación",
      metadata: { error }
    })

  }
}

/* =========================
   📧 EMAIL SIMPLE (NUEVO)
========================= */
async function sendSimpleEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {

  // ⚠️ reutiliza tu sistema actual de envío
  // si ya tienes sendEmail general, usa ese

  const res = await fetch("/api/send-email", {
    method: "POST",
    body: JSON.stringify({
      to,
      subject,
      html
    })
  })

  if (!res.ok) {
    throw new Error("email failed")
  }
}