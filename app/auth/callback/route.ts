import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)

    // 🔥 CLAVE: usar access_token directo
    const access_token = url.searchParams.get("access_token")

    if (!access_token) {
      console.error("❌ NO ACCESS TOKEN")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    // 🔐 Obtener usuario REAL desde token
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabaseAuth.auth.getUser(access_token)

    if (error || !data?.user?.email) {
      console.error("❌ GET USER ERROR:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const email = data.user.email.toLowerCase()

    console.log("🔥 CALLBACK USER:", email)

    // 🔎 verificar si ya se envió
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("email", email)
      .maybeSingle()

    if (!profile?.welcome_sent) {

      try {
        await resend.emails.send({
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

        console.log("📧 WELCOME ENVIADO")

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