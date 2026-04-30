import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET() {
  try {

    // 🔎 Buscar eventos pendientes
    const { data: events, error } = await supabase
      .from("user_events")
      .select("*")
      .eq("processed", false)

    if (error) {
      console.error("❌ ERROR EVENTOS:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log("EVENTOS:", events)

    for (const event of events || []) {

      if (event.event_type === "USER_CONFIRMED") {

        // 🔎 Ver perfil
        const { data: profile } = await supabase
          .from("profiles")
          .select("welcome_sent")
          .eq("id", event.user_id)
          .single()

        // 🚀 Si no se ha enviado
        if (!profile?.welcome_sent) {

          console.log("📧 ENVIANDO EMAIL A:", event.email)

          await resend.emails.send({
            from: "ImpulsaSueños <contacto@impulsasuenos.com>",
            to: event.email,
            subject: "🎉 Bienvenido a ImpulsaSueños",
            html: `<h2>Bienvenido 🚀</h2>`
          })

          // ✅ Marcar como enviado
          await supabase
            .from("profiles")
            .update({ welcome_sent: true })
            .eq("id", event.user_id)
        }
      }

      // ✅ Marcar evento como procesado
      await supabase
        .from("user_events")
        .update({ processed: true })
        .eq("id", event.id)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("❌ ERROR WORKER:", err)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}