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

    const email = user_email?.toLowerCase()

    console.log("📨 SEND NOTIFICATION:", {
      email,
      type,
      sendEmail
    })

    if (!email) {
      console.error("❌ Email inválido en sendNotification")
      return
    }

    /* =========================
       🧾 SAVE NOTIFICATION
    ========================= */
    const { error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_email: email,
        type,
        title,
        message,
        metadata,
        read: false,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error("❌ Notification insert error:", insertError)
      throw insertError
    }

    if (!sendEmail) return

    try {

      const FROM = process.env.RESEND_FROM || "no-reply@impulsasuenos.com"

      let response: any = null

      /* =========================
         💖 DONACIÓN
      ========================= */
      if (type === "donation") {

  console.log("🔥 DONATION EMAIL TRIGGER")

  const campaignName = metadata?.campaign_title || "Tu campaña"
  const amount = Number(metadata?.amount || 0)

  try {

    await sendDonationEmail({
      to: email,
      campaign: campaignName,
      amount
    })

    console.log("✅ DONATION EMAIL ENVIADO")

  } catch (err) {

    console.error("❌ ERROR sendDonationEmail:", err)

    // 🔥 FALLBACK DIRECTO (CRÍTICO PARA LANZAMIENTO)
    await resend.emails.send({
      from: process.env.RESEND_FROM || "no-reply@impulsasuenos.com",
      to: email,
      subject: "🙏 Gracias por tu donación",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>🙏 Gracias por tu donación</h2>
          <p>Has donado <b>$${amount.toLocaleString()}</b></p>
          <p>A la campaña: <b>${campaignName}</b></p>
          <br/>
          <p>💚 Gracias por apoyar esta causa</p>
        </div>
      `
    })

    console.log("⚠️ FALLBACK EMAIL ENVIADO")
  }

  return
}

      /* =========================
         EMAIL HELPER
      ========================= */
      const send = async (subject: string, html: string) => {
        const res = await resend.emails.send({
          from: FROM,
          to: email,
          subject,
          html
        })

        if (!res || res.error) {
          throw new Error(res?.error?.message || "resend_error")
        }

        return res
      }

      /* =========================
         EMAIL TYPES
      ========================= */

      if (type === "donation_received") {
        response = await send(
          "💸 Recibiste una donación",
          baseTemplate(`
            <h3>🎉 Nueva donación</h3>
            <p>Recibiste un aporte en tu campaña.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Campaña:</b> ${metadata?.campaign_title || "Sin nombre"}</p>
              <p><b>Monto:</b> $${Number(metadata?.amount || 0).toLocaleString()}</p>
            </div>
          `)
        )
      }

      else if (type === "kyc_approved") {
        response = await send(
          "✅ Verificación aprobada",
          baseTemplate(`
            <h3>✅ Verificación aprobada</h3>
            <p>Ya puedes crear campañas y retirar fondos.</p>
          `)
        )
      }

      else if (type === "kyc_rejected") {
        response = await send(
          "❌ Verificación rechazada",
          baseTemplate(`
            <h3>❌ Verificación rechazada</h3>
            <p>Revisa tus documentos e intenta nuevamente.</p>
          `)
        )
      }

      else if (type === "payout_requested") {
        response = await send(
          "⏳ Retiro en revisión",
          baseTemplate(`
            <h3>⏳ Retiro en revisión</h3>
            <p>Tu solicitud fue recibida.</p>
            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Monto:</b> $${Number(metadata?.amount || 0).toLocaleString()}</p>
            </div>
          `)
        )
      }

      else if (type === "payout_paid") {
        response = await send(
          "🎉 Retiro aprobado",
          baseTemplate(`
            <h3>🎉 Retiro aprobado</h3>
            <p>Tu retiro fue procesado correctamente.</p>
          `)
        )
      }

      else if (type === "payout_rejected") {
        response = await send(
          "❌ Retiro rechazado",
          baseTemplate(`
            <h3>❌ Retiro rechazado</h3>
            <p>Revisa la información y vuelve a intentarlo.</p>
          `)
        )
      }

      else if (type === "otp_code") {
        response = await send(
          "🔐 Código de verificación",
          baseTemplate(`
            <h3>🔐 Código de seguridad</h3>
            <p>Usa este código para continuar:</p>

            <div style="background:#f9fafb;padding:20px;border-radius:10px;text-align:center;">
              <h1 style="letter-spacing:4px;">
                ${metadata?.code || "------"}
              </h1>
            </div>

            <p style="margin-top:15px;font-size:13px;color:#666;">
              Este código expira en 5 minutos.
            </p>
          `)
        )
      }

      else if (type === "bank_updated") {
        response = await send(
          "🏦 Cuenta bancaria actualizada",
          baseTemplate(`
            <h3>🏦 Cuenta actualizada</h3>
            <p>Se modificó tu cuenta bancaria.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Banco:</b> ${metadata?.bank_name || "-"}</p>
            </div>

            <p style="margin-top:10px;color:#666;">
              Si no fuiste tú, contacta soporte inmediatamente.
            </p>
          `)
        )
      }

      else if (type === "bank_deleted") {
        response = await send(
          "🗑 Cuenta bancaria eliminada",
          baseTemplate(`
            <h3>🗑 Cuenta eliminada</h3>
            <p>Eliminaste una cuenta bancaria de tu perfil.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Banco:</b> ${metadata?.bank_name || "-"}</p>
            </div>

            <p style="margin-top:10px;color:#666;">
              Si no fuiste tú, cambia tu contraseña inmediatamente y contacta soporte.
            </p>
          `)
        )
      }

      else if (type === "campaign_created") {
        response = await send(
          "🚀 Tu campaña está activa",
          baseTemplate(`
            <h3>🚀 Campaña creada con éxito</h3>
            <p>Tu campaña ya está disponible para recibir donaciones.</p>

            <div style="background:#f9fafb;padding:15px;border-radius:10px;">
              <p><b>Título:</b> ${metadata?.campaign_title || "Sin título"}</p>
              <p><b>Meta:</b> $${Number(metadata?.goal_amount || 0).toLocaleString()}</p>
            </div>

            <p style="margin-top:10px;">
              Comparte tu campaña y comienza a recibir apoyo 💚
            </p>
          `)
        )
      }

    } catch (err: any) {

      console.error("❌ EMAIL ERROR REAL:", err)

      await logSystemEvent({
        type: "notification_email_error",
        severity: "warning",
        message: err?.message || "email_error",
        metadata: {
          user_email: email,
          type,
          error_message: err?.message || "unknown",
          error_name: err?.name || "unknown"
        }
      })

      throw err
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

    throw error
  }
}