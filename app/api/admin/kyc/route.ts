import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNotification } from "@/lib/notifications/sendNotification"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { user_email, status } = await req.json()

    if (!user_email || !status) {
      return NextResponse.json({ error: "missing data" }, { status: 400 })
    }

    const allowedStatus = ["pending", "approved", "rejected"]

    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 })
    }

    const { error } = await supabase
      .from("kyc")
      .update({
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq("user_email", user_email)

    if (error) {
      return NextResponse.json({ error: "update failed" }, { status: 500 })
    }

    /* =========================
       🔔 NOTIFICACIONES USUARIO
    ========================= */
    if (status === "approved") {

      // 🟢 MARCAR USUARIO COMO VERIFIED (SOLO AQUÍ)
      try {
        await supabase
          .from("profiles")
          .update({ account_status: "verified" })
          .eq("email", user_email)
      } catch (e) {
        console.error("⚠️ Error actualizando account_status:", e)
        // no rompe flujo
      }

      await sendNotification({
        user_email,
        type: "kyc_approved",
        title: "KYC aprobado",
        message: "Tu identidad fue verificada. Ya puedes crear campañas y retirar fondos.",
        metadata: { status },
        sendEmail: true
      })
    }

    if (status === "rejected") {
      await sendNotification({
        user_email,
        type: "kyc_rejected",
        title: "KYC rechazado",
        message: "Tu verificación fue rechazada. Revisa los documentos y vuelve a intentarlo.",
        metadata: { status },
        sendEmail: true
      })
    }

    /* =========================
       👑 NOTIFICACIÓN ADMIN (OPCIONAL)
    ========================= */
    if (status === "pending") {
      await sendNotification({
        user_email: "admin@impulsasuenos.com",
        type: "kyc_submitted",
        title: "Nuevo KYC pendiente",
        message: `El usuario ${user_email} envió verificación`,
        metadata: { user_email },
        sendEmail: false
      })
    }

    return NextResponse.json({
      ok: true,
      message: `KYC actualizado a ${status}`
    })

  } catch (err) {

    console.error("KYC ADMIN ERROR:", err)

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}