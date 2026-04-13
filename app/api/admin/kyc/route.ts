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
       🔔 NOTIFICACIONES
    ========================= */
    if (status === "approved") {
      await sendNotification({
        user_email,
        type: "kyc_approved",
        title: "Verificación aprobada",
        message: "Tu identidad fue verificada correctamente",
        sendEmail: true
      })
    }

    if (status === "rejected") {
      await sendNotification({
        user_email,
        type: "kyc_rejected",
        title: "Verificación rechazada",
        message: "Tu verificación fue rechazada, revisa los documentos enviados",
        sendEmail: true
      })
    }

    return NextResponse.json({
      ok: true,
      message: `KYC actualizado a ${status}`
    })

  } catch (err) {

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}