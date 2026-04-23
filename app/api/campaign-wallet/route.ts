import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    /* =========================
       🔐 AUTH
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase()

    /* =========================
       📥 PARAMS
    ========================= */
    const { searchParams } = new URL(req.url)
    const campaign_id = searchParams.get("campaign_id")

    if (!campaign_id) {
      return NextResponse.json(
        { error: "campaign_id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       🔐 VALIDAR PROPIEDAD
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign || campaign.user_email !== user_email) {
      return NextResponse.json(
        { error: "no autorizado" },
        { status: 403 }
      )
    }

    /* =========================
       🔓 LIBERACIÓN AUTOMÁTICA (SAFE)
    ========================= */
    const cutoff = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()

    await supabase
      .from("financial_ledger")
      .update({ status: "confirmed" })
      .eq("flow_type", "in")
      .eq("status", "pending")
      .eq("campaign_id", campaign_id)
      .lte("created_at", cutoff)

    /* =========================
       💰 BALANCE REAL
    ========================= */
    const wallet = await calculateCampaignBalance(
      supabase,
      campaign_id
    )

    return NextResponse.json({
      balance: wallet.available,
      pending: wallet.pending,
      totalIn: wallet.totalIn,
      totalOut: wallet.totalOut
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}