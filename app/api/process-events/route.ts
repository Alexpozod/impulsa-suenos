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

    const { data: events, error } = await supabase
      .from("user_events")
      .select("*")
      .eq("processed", false)

    if (error) {
      console.error("❌ FETCH EVENTS:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    for (const event of events || []) {

      if (event.event_type === "USER_CONFIRMED") {

        const { data: profile } = await supabase
          .from("profiles")
          .select("welcome_sent")
          .eq("id", event.user_id)
          .single()

        if (!profile?.welcome_sent) {

          await resend.emails.send({
            from: "ImpulsaSueños <contacto@impulsasuenos.com>",
            to: event.email,
            subject: "🎉 Bienvenido a ImpulsaSueños",
            html: `<h2>Bienvenido 🚀</h2>`
          })

          await supabase
            .from("profiles")
            .update({ welcome_sent: true })
            .eq("id", event.user_id)
        }
      }

      await supabase
        .from("user_events")
        .update({ processed: true })
        .eq("id", event.id)
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("❌ WORKER ERROR:", err)
    return NextResponse.json({ error: "error" }, { status: 500 })
  }
}