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

    // 🔥 obtener campañas del usuario
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
      console.warn("⚠️ usuario sin campañas")
      return NextResponse.json([])
    }

    // 🔥 traer ledger SOLO de sus campañas (SIN LIMIT)
    const { data, error } = await supabase
      .from("financial_ledger")
      .select("*")
      .in("campaign_id", campaignIds)

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