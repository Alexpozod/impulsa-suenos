import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📥 OBTENER NOTIFICACIONES
========================= */
export async function GET(req: Request) {
  try {

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    /* =========================
       🔥 NORMALIZACIÓN REAL
    ========================= */
    const formatted = (data || []).map((n: any) => {

      const type = n.type || n.event_type
      const meta = n.metadata || {}

      let title = "🔔 Nueva notificación"
      let message = ""

      /* =========================
         💰 DONACIÓN
      ========================= */
      if (type === "donation" || type === "payment") {
        title = "💰 Donación recibida"

        const amount = Number(meta.amount || meta.donation || 0)
        const campaign = meta.campaign_title || "tu campaña"

        const donor = meta.donor_name || "Alguien"
        message = `${donor} donó $${amount.toLocaleString()} en ${campaign}`
      }

      /* =========================
         🏦 RETIRO
      ========================= */
      if (type === "withdraw") {

  const status = n.status || meta.status

  if (status === "pending") {
    title = "⏳ Retiro en revisión"
    message = "Tu solicitud está siendo revisada"
  }

  if (status === "approved") {
    title = "🏦 Retiro aprobado"
    message = "Tu retiro fue aprobado"
  }

  if (status === "rejected") {
    title = "❌ Retiro rechazado"
    message = "Tu retiro fue rechazado"
  }
}

      /* =========================
         🛡️ KYC
      ========================= */
      if (type === "kyc_approved") {
        title = "✅ Verificación aprobada"
        message = "Tu identidad fue validada correctamente"
      }

      if (type === "kyc_rejected") {
        title = "⚠️ Verificación rechazada"
        message = "Debes subir nuevamente tus documentos"
      }

      /* =========================
         📢 FALLBACK INTELIGENTE
      ========================= */
      if (!message) {
        message =
          meta?.message ||
          meta?.description ||
          "Tienes una nueva actividad en tu cuenta"
      }

      return {
        id: n.id,
        title,
        message,
        type, // 🔥 NECESARIO
        metadata: meta, // 🔥 NECESARIO
        status: n.status || null, // 🔥 para retiros
        created_at: n.created_at,
        read: n.read || false
      }
    })

    return NextResponse.json(formatted)

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/* =========================
   🔘 MARCAR COMO LEÍDO
========================= */
export async function POST(req: Request) {
  try {

    const body = await req.json()
    const id = body?.id

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 })
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}