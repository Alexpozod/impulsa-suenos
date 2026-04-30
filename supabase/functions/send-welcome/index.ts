import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { email } = await req.json()

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "ImpulsaSueños <contacto@impulsasuenos.com>",
        to: email,
        subject: "🎉 Bienvenido a ImpulsaSueños",
        html: "<h2>Bienvenido 🚀</h2>"
      })
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 500 })
  }
})