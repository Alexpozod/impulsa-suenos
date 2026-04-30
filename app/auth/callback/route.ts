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
    const token = url.searchParams.get("access_token")

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token)

    const user = userData?.user

    if (userError || !user || !user.email) {
      console.error("❌ USER ERROR:", userError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    // 🔐 VALIDACIÓN REAL: EMAIL CONFIRMADO
    if (!user.email_confirmed_at) {
      console.warn("⚠️ Usuario no confirmado intentó callback")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const email = user.email.toLowerCase()

    console.log("🔥 CALLBACK CONFIRMADO:", email)

    /* =========================
       🔎 PERFIL
    ========================= */
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("welcome_sent")
      .eq("email", email)
      .maybeSingle()

    const alreadySent = profile?.welcome_sent === true

    /* =========================
       🚀 ENVÍO CONTROLADO
    ========================= */
    if (!alreadySent) {

      try {

        const res = await resend.emails.send({
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

        if (!res || (res as any).error) {
          throw new Error((res as any)?.error?.message || "resend_error")
        }

        console.log("📧 WELCOME ENVIADO:", email)

        // 🔒 MARCAR SOLO SI SE ENVIÓ BIEN
        await supabaseAdmin
          .from("profiles")
          .upsert({
            email,
            welcome_sent: true
          })

      } catch (emailError) {

        console.error("❌ ERROR ENVIANDO WELCOME:", emailError)

        // ❗ NO bloquea flujo
      }
    } else {
      console.log("ℹ️ Welcome ya enviado:", email)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

  } catch (err) {

    console.error("❌ CALLBACK ERROR:", err)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }
}