import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      console.error("❌ No auth header")
      return NextResponse.json([])
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token)

    if (userError || !userData?.user) {
      console.error("❌ Invalid user")
      return NextResponse.json([])
    }

    const email = userData.user.email

    /* =========================
   🔐 VALIDAR ADMIN
========================= */
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", userData.user.id)
  .maybeSingle()

const isAdmin = profile?.role === "admin"

/* =========================
   👑 ADMIN → VER TODO
========================= */
if (isAdmin) {

  const { data, error } = await supabase
    .from("financial_ledger")
    .select(`
      *,
      campaigns (
        title
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) {
    console.error("❌ admin ledger error:", error)
    return NextResponse.json([])
  }

  return NextResponse.json(data || [])
}

/* =========================
   👤 USER → SOLO SUS CAMPAÑAS
========================= */
const { data: campaigns, error: campaignsError } = await supabase
  .from("campaigns")
  .select("id")
  .eq("user_email", email)

if (campaignsError) {
  console.error("❌ campaigns error:", campaignsError)
  return NextResponse.json([])
}

const campaignIds = (campaigns || []).map(c => c.id)

if (campaignIds.length === 0) {
  return NextResponse.json([])
}

const { data, error } = await supabase
  .from("financial_ledger")
  .select(`
    *,
    campaigns (
      title
    )
  `)
  .in("campaign_id", campaignIds)
  .order("created_at", { ascending: false })

if (error) {
  console.error("❌ ledger error:", error)
  return NextResponse.json([])
}

return NextResponse.json(data || [])

    if (error) {
      console.error("❌ ledger error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error("❌ ledger crash:", error)
    return NextResponse.json([])
  }
}