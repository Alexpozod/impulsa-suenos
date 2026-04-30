import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)

    console.log("🔥 CALLBACK HIT")

    // 🔥 AQUÍ ESTÁ EL FIX REAL
    const access_token = url.searchParams.get("access_token")

    if (!access_token) {
      console.error("❌ NO ACCESS TOKEN")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabaseAuth.auth.getUser(access_token)

    if (error || !data?.user) {
      console.error("❌ USER ERROR:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const user = data.user
    const email = user.email?.toLowerCase()

    if (!email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    console.log("✅ USER CONFIRMADO:", email)

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
       📧 EMAIL
    ========================= */
    if (!alreadySent) {
      try {

        await resend.emails.send({
          from: "ImpulsaSueños <contacto@impulsasuenos.com>",
          to: email,
          subject: "🎉 Bienvenido a ImpulsaSueños",
          html: `
            <div style="font-family: Arial; padding:20px;">
              <h2>🎉 Bienvenido a ImpulsaSueños</h2>
              <p>Tu cuenta ha sido activada correctamente.</p>
            </div>
          `
        })

        await supabaseAdmin
          .from("profiles")
          .upsert({
            email,
            welcome_sent: true
          })

        console.log("📧 EMAIL ENVIADO")

      } catch (err) {
        console.error("❌ EMAIL ERROR:", err)
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

  } catch (err) {

    console.error("❌ CALLBACK ERROR:", err)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }
}