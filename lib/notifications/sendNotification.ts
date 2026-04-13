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
       📧 EMAIL OPCIONAL
    ========================= */
    if (sendEmail) {

      try {

        await sendDonationEmail({
          to: user_email,
          campaign: title,
          amount: metadata?.amount || 0
        })

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