import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { campaign_id, amount } = await req.json()

    if (!campaign_id || !amount) {
      return NextResponse.json(
        { error: "datos incompletos" },
        { status: 400 }
      )
    }

    // =========================
    // 🔐 AUTH
    // =========================
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

    logInfo("Payout request iniciado", {
      user_email,
      campaign_id,
      amount
    })

    // =========================
    // 🔒 VALIDAR CAMPAÑA
    // =========================
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json(
        { error: "campaña no encontrada" },
        { status: 404 }
      )
    }

    if (campaign.user_email !== user_email) {
      return NextResponse.json(
        { error: "no autorizado para esta campaña" },
        { status: 403 }
      )
    }

    // =========================
    // 🚫 BLOQUEO DUPLICADO
    // =========================
    const { data: existing } = await supabase
      .from("payouts")
      .select("id")
      .eq("campaign_id", campaign_id)
      .eq("status", "pending")
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes un retiro en proceso" },
        { status: 400 }
      )
    }

    // =========================
    // 💰 BALANCE REAL
    // =========================
    const wallet = await calculateCampaignBalance(
      supabase,
      campaign_id
    )

    if (!wallet || typeof wallet.balance !== "number") {
      await sendAlert({
        title: "Error cálculo balance",
        message: "No se pudo calcular balance en payout",
        data: { campaign_id }
      })

      return NextResponse.json(
        { error: "error calculando balance" },
        { status: 500 }
      )
    }

    if (Number(amount) > wallet.balance) {
      return NextResponse.json(
        { error: "saldo insuficiente" },
        { status: 400 }
      )
    }

    // =========================
    // 🏦 CREAR PAYOUT
    // =========================
    const { data, error } = await supabase
      .from("payouts")
      .insert({
        campaign_id,
        amount,
        status: "pending",
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    await logToDB("info", "payout_requested", {
      campaign_id,
      amount,
      user_email
    })

    logInfo("Payout creado", {
      payout_id: data.id,
      campaign_id,
      amount
    })

    return NextResponse.json({
      ok: true,
      message: "Tu retiro está en revisión y puede tardar entre 2 a 5 días hábiles.",
      payout: data
    })

  } catch (error) {
    logError("PAYOUT REQUEST ERROR", error)
    await logErrorToDB("payout_request_error", error)

    await sendAlert({
      title: "Error solicitud payout",
      message: "Fallo al solicitar retiro",
      data: { error }
    })

    return NextResponse.json(
      { error: "error payout" },
      { status: 500 }
    )
  }
}