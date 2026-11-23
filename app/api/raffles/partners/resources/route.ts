import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireUser } from "@/lib/auth/requireUser"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>
  try {
    user = await requireUser(req)
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const email = user.email?.trim().toLowerCase()
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  try {
    const { data: affiliate, error: affiliateError } = await supabase
      .schema("raffles").from("raffle_referrals")
      .select("id").eq("owner_email", email).eq("active", true).maybeSingle()

    if (affiliateError) throw affiliateError
    if (!affiliate) return NextResponse.json({ error: "forbidden" }, { status: 403 })

    const { data, error } = await supabase
      .schema("raffles").from("partner_resources")
      .select("*").eq("is_active", true).order("category").order("sort_order")

    if (error) throw error
    return NextResponse.json({ ok: true, resources: data || [] })
  } catch {
    console.error("raffles_partner_resources_failed")
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
