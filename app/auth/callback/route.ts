import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export const runtime = "nodejs"

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
    const code = url.searchParams.get("code")

    console.log("🔥 CALLBACK HIT")
    console.log("🔑 CODE:", code)

    if (!code) {
      console.error("❌ NO CODE")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    /* =========================
       🔐 INTERCAMBIO DE SESSION
    ========================= */
    let user: any = null

    try {
      const { data, error } =
        await supabaseAuth.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ EXCHANGE ERROR:", error)
        throw error
      }

      user = data?.user

    } catch (err) {
      console.error("❌ FALLBACK AUTH ERROR:", err)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    if (!user || !user.email) {
      console.error("❌ NO USER")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    const email = user.email.toLowerCase()

    console.log("✅ USER:", email)

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
       📧 ENVÍO EMAIL
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
              <p>Ya puedes comenzar 💚</p>
            </div>
          `
        })

        console.log("📧 EMAIL RESPONSE:", res)

        await supabaseAdmin
          .from("profiles")
          .upsert({
            email,
            welcome_sent: true
          })

      } catch (emailError) {
        console.error("❌ EMAIL ERROR:", emailError)
      }
    }

    console.log("🚀 REDIRECTING...")

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      { status: 302 }
    )

  } catch (err) {

    console.error("❌ CALLBACK CRASH:", err)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      { status: 302 }
    )
  }
}