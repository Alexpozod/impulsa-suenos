import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
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
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const email = user.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let otp: unknown
  try {
    const body = await req.json()
    otp = body?.otp
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 })
  }

  if (typeof otp !== "string" || otp.trim().length < 4 || otp.trim().length > 32) {
    return NextResponse.json({ ok: false, error: "otp_required" }, { status: 400 })
  }

  try {
    const { data: affiliate, error: affiliateError } = await supabase
      .schema("raffles")
      .from("raffle_referrals")
      .select("id")
      .eq("owner_email", email)
      .maybeSingle()

    if (affiliateError) throw affiliateError
    if (!affiliate) {
      return NextResponse.json({ ok: false, error: "affiliate_not_found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .schema("raffles")
      .rpc("unlock_partner_profile", {
        p_affiliate_id: affiliate.id,
        p_email: email,
        p_otp: otp.trim()
      })

    if (error) throw error

    if (data?.outcome === "unlocked" && typeof data.unlockUntil === "string") {
      return NextResponse.json({ ok: true, unlockUntil: data.unlockUntil })
    }

    const outcome = typeof data?.outcome === "string" ? data.outcome : "server_error"
    const status = outcome === "invalid_otp" || outcome === "invalid_request" ? 400
      : outcome === "affiliate_not_found" || outcome === "profile_not_found" ? 404 : 500
    return NextResponse.json({ ok: false, error: outcome }, { status })
  } catch {
    console.error("raffles_partner_profile_unlock_failed")
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}
