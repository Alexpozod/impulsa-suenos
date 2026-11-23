import { randomInt } from "node:crypto"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { requireUser } from "@/lib/auth/requireUser"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>
  try {
    user = await requireUser(req)
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const email = user.email?.trim().toLowerCase()
  if (!email || !user.email_confirmed_at) {
    return NextResponse.json({ error: "email_unverified" }, { status: 403 })
  }

  try {
    const { data: affiliate, error: affiliateError } = await supabase
      .schema("raffles").from("raffle_referrals")
      .select("id").eq("owner_email", email).eq("active", true).maybeSingle()
    if (affiliateError) throw affiliateError
    if (!affiliate) return NextResponse.json({ error: "affiliate_not_found" }, { status: 403 })

    // A single SQL upsert serializes requests for each affiliate across
    // serverless instances and IP addresses (5 per 60 seconds).
    const { data: allowed, error: throttleError } = await supabase
      .schema("raffles")
      .rpc("claim_partner_otp_send", { p_affiliate_id: affiliate.id })

    if (throttleError) throw throttleError
    if (allowed !== true) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 })
    }

    const code = String(randomInt(100000, 1000000))
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const { error: invalidationError } = await supabase.from("otp_codes")
      .update({ used: true }).eq("user_email", email).eq("used", false)
    if (invalidationError) throw invalidationError

    const { data: otpRecord, error: insertError } = await supabase
      .from("otp_codes")
      .insert({ user_email: email, code, expires_at, verified: false, used: false })
      .select("id")
      .single()
    if (insertError || !otpRecord) throw insertError || new Error("otp_not_created")

    const resend = new Resend(process.env.RESEND_API_KEY!)
    const sent = await resend.emails.send({
      from: process.env.RESEND_FROM || "no-reply@impulsasuenos.com",
      to: email,
      subject: "Código de seguridad · ImpulsaSueños Sorteos",
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2>ImpulsaSueños Sorteos</h2>
        <p>Tu código de seguridad es:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
        <p>Válido durante 5 minutos. No lo compartas con nadie.</p>
      </div>`
    })

    if (sent.error) {
      await supabase.from("otp_codes").update({ used: true }).eq("id", otpRecord.id)
      console.error("raffles_otp_email_delivery_failed")
      return NextResponse.json({ error: "otp_delivery_failed" }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    console.error("raffles_otp_send_failed")
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
