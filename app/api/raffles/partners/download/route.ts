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

  const path = new URL(req.url).searchParams.get("path")
  if (!path || path.length > 512 || path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "invalid_path" }, { status: 400 })
  }

  try {
    const { data: affiliate, error: affiliateError } = await supabase
      .schema("raffles").from("raffle_referrals")
      .select("id").eq("owner_email", email).eq("active", true).maybeSingle()

    if (affiliateError) throw affiliateError
    if (!affiliate) return NextResponse.json({ error: "forbidden" }, { status: 403 })

    const { data: resource, error: resourceError } = await supabase
      .schema("raffles").from("partner_resources")
      .select("id,download_count").eq("storage_path", path).eq("is_active", true).maybeSingle()

    if (resourceError) throw resourceError
    if (!resource) return NextResponse.json({ error: "not_found" }, { status: 404 })

    const { data, error } = await supabase.storage
      .from("partner-resources").createSignedUrl(path, 60 * 5)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }

    // Keep the existing download statistic without granting access to unknown paths.
    const { error: trackingError } = await supabase
      .schema("raffles").from("partner_resources")
      .update({ download_count: (resource.download_count || 0) + 1 })
      .eq("id", resource.id)
    if (trackingError) console.error("raffles_resource_download_tracking_failed")

    return NextResponse.json({ ok: true, url: data.signedUrl })
  } catch {
    console.error("raffles_partner_resource_download_failed")
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
