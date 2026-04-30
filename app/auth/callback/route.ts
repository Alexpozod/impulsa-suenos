import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const token = url.searchParams.get("access_token")

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: userData } = await supabaseAuth.auth.getUser(token)

    const user = userData?.user

    if (!user || !user.email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const email = user.email.toLowerCase()

    // 🔎 VERIFICAR SI YA SE ENVIÓ WELCOME
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_sent")
      .eq("email", email)
      .maybeSingle()

    if (!profile?.welcome_sent) {

      // 🚀 ENVIAR EMAIL DE BIENVENIDA
      await resend.emails.send({
        from: "ImpulsaSueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "🎉 Bienvenido a ImpulsaSueños",
        html: `
          <div style="font-family: Arial; padding:20px;">
            <h2>🎉 Bienvenido a ImpulsaSueños</h2>
            <p>Tu cuenta ha sido activada correctamente.</p>
            <p>Ya puedes crear campañas y comenzar a recibir apoyo 💚</p>
          </div>
        `
      })

      // 🔒 MARCAR COMO ENVIADO
      await supabase
        .from("profiles")
        .update({ welcome_sent: true })
        .eq("email", email)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

  } catch (err) {

    console.error("❌ CALLBACK ERROR:", err)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }
}