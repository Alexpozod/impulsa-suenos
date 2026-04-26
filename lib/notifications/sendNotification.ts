import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { sendDonationEmail } from "@/lib/email"
import { logSystemEvent } from "@/lib/system/logger"

const resend = new Resend(process.env.RESEND_API_KEY!)

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

/* =========================
   🎨 TEMPLATE BASE PRO
========================= */
function baseTemplate(content: string) {
  return `
  <div style="font-family: Arial; background:#f4f4f5; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:12px;">
      
      <h2 style="color:#16a34a;">💚 ImpulsaSueños</h2>

      ${content}

      <hr style="margin:25px 0"/>

      <p style="font-size:12px; color:#666;">
        Este correo fue generado automáticamente.
      </p>

    </div>
  </div>
  `
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

    await supabase.from("notifications").insert({
      user_email,
      type,
      title,
      message,
      metadata,
      read: false,
      created_at: new Date().toISOString()
    })

    if (!sendEmail) return

    try {

      const FROM = process.env.RESEND_FROM || "onboarding@resend.dev"

      // 💖 DONACIÓN
      if (type === "donation") {

  const campaignName =
    metadata?.campaign_title ||
    "Tu campaña"

  const amount =
    Number(metadata?.amount || 0)

  await sendDonationEmail({
    to: user_email,
    campaign: campaignName,
    amount
  })
}

      // 🎯 DONACIÓN RECIBIDA
      else if (type === "donation_received") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "💸 Recibiste una donación",
          html: baseTemplate(`
            <h3>🎉 Nueva donación</h3>
            <p>Recibiste un aporte en tu campaña.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Monto:</b> $${Number(metadata?.amount || 0).toLocaleString()}</p>
            </div>
          `)
        })
      }

      // 🪪 KYC APROBADO
      else if (type === "kyc_approved") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "✅ Verificación aprobada",
          html: baseTemplate(`
            <h3>✅ Verificación aprobada</h3>
            <p>Ya puedes crear campañas y retirar fondos.</p>
          `)
        })
      }

      // ❌ KYC
      else if (type === "kyc_rejected") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "❌ Verificación rechazada",
          html: baseTemplate(`
            <h3>❌ Verificación rechazada</h3>
            <p>Revisa tus documentos e intenta nuevamente.</p>
          `)
        })
      }

      // 💸 REQUEST
      else if (type === "payout_requested") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "⏳ Retiro en revisión",
          html: baseTemplate(`
            <h3>⏳ Retiro en revisión</h3>
            <p>Tu solicitud fue recibida.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Monto:</b> $${Number(metadata?.amount || 0).toLocaleString()}</p>
            </div>
          `)
        })
      }

      // ✅ PAID
      else if (type === "payout_paid") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "🎉 Retiro aprobado",
          html: baseTemplate(`
            <h3>🎉 Retiro aprobado</h3>
            <p>Tu retiro fue procesado correctamente.</p>
          `)
        })
      }

      // ❌ REJECTED
      else if (type === "payout_rejected") {
        await resend.emails.send({
          from: FROM,
          to: user_email,
          subject: "❌ Retiro rechazado",
          html: baseTemplate(`
            <h3>❌ Retiro rechazado</h3>
            <p>Revisa la información y vuelve a intentarlo.</p>
          `)
        })
      }

    } catch (err: any) {

      console.error("❌ EMAIL ERROR REAL:", err)

      await logSystemEvent({
        type: "notification_email_error",
        severity: "warning",
        message: err?.message || "email_error",
        metadata: {
          user_email,
          type,
          error_message: err?.message || "unknown",
          error_name: err?.name || "unknown"
        }
      })

    }

  } catch (error: any) {

    await logSystemEvent({
      type: "notification_error",
      severity: "warning",
      message: error?.message || "notification_error",
      metadata: {
        error_message: error?.message || "unknown"
      }
    })
  }
}