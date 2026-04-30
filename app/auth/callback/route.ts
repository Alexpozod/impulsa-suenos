import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)

    // 🔥 ESTE ES EL CAMBIO CLAVE
    const { data: { user }, error } = await supabaseAuth.auth.getUser()

    if (error || !user || !user.email) {
      console.error("❌ USER ERROR:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    if (!user.email_confirmed_at) {
      console.warn("⚠️ Usuario no confirmado")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const email = user.email.toLowerCase()

    console.log("🔥 CALLBACK OK:", email)

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("email", email)
      .maybeSingle()

    if (!profile?.welcome_sent) {

      try {

        const res = await resend.emails.send({
          from: "ImpulsaSueños <contacto@impulsasuenos.com>",
          to: email,
          subject: "🎉 Bienvenido a ImpulsaSueños",
          html: `
            <div style="font-family: Arial; padding:20px;">
              <h2>🎉 Bienvenido a ImpulsaSueños</h2>
              <p>Tu cuenta fue activada correctamente.</p>
              <p>Ya puedes crear campañas y comenzar a recibir apoyo 💚</p>
            </div>
          `
        })

        if ((res as any)?.error) {
          throw new Error((res as any).error.message)
        }

        console.log("📧 WELCOME ENVIADO:", email)

        await supabaseAdmin
          .from("profiles")
          .upsert({
            email,
            welcome_sent: true
          })

      } catch (e) {
        console.error("❌ ERROR EMAIL:", e)
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

  } catch (err) {

    console.error("❌ CALLBACK CRASH:", err)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }
}