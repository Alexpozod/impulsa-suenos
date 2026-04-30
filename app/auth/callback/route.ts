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

    /* =========================
       🔐 EXCHANGE CODE (FIX REAL)
    ========================= */
    const code = url.searchParams.get("code")

    if (!code) {
      console.error("❌ NO CODE IN CALLBACK")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const { data: sessionData, error: sessionError } =
      await supabaseAuth.auth.exchangeCodeForSession(code)

    const user = sessionData?.user

    if (sessionError || !user || !user.email) {
      console.error("❌ SESSION ERROR:", sessionError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    /* =========================
       🔐 VALIDACIÓN REAL
    ========================= */
    if (!user.email_confirmed_at) {
      console.warn("⚠️ Usuario no confirmado")
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

        /* =========================
           🔒 MARCAR COMO ENVIADO
        ========================= */
        await supabaseAdmin
          .from("profiles")
          .upsert({
            email,
            welcome_sent: true
          })

      } catch (emailError) {
        console.error("❌ ERROR ENVIANDO WELCOME:", emailError)
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