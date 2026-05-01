import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateCampaignBalance } from "@/lib/calculateCampaignBalance"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { rateLimit } from "@/lib/security/rateLimit"
import { sendNotification } from "@/lib/notifications/sendNotification"
import crypto from "crypto"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {

    /* =========================
       🔐 AUTH
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user }, error: userError } =
      await supabase.auth.getUser(token)

    if (userError || !user?.email) {
      return NextResponse.json({ error: "invalid user" }, { status: 401 })
    }

    const user_email = user.email.toLowerCase()

    /* =========================
       🟢 VALIDACIÓN NUEVA (NO ROMPE NADA)
       account_status debe ser verified
    ========================= */
    const { data: profile } = await supabase
  .from("profiles")
  .select("account_status")
  .eq("id", user.id)
  .maybeSingle()

// 🔓 NO BLOQUEAR SI KYC YA EXISTE (EVITA DOBLE VALIDACIÓN)
if (
  profile &&
  profile.account_status &&
  profile.account_status !== "verified"
) {
  console.warn("⚠️ account_status no es verified pero se continúa por KYC:", {
    user_email,
    account_status: profile.account_status
  })
}

    /* =========================
       📥 INPUT (FIX CRÍTICO)
    ========================= */
    const body = await req.json()

    const {
      campaign_id,
      amount,
      otp_code
    } = body

    if (!campaign_id || !amount) {
      return NextResponse.json({ error: "datos incompletos" }, { status: 400 })
    }

    if (!otp_code) {
      return NextResponse.json(
        { error: "OTP requerido" },
        { status: 400 }
      )
    }

    const numericAmount = Number(amount)

    if (numericAmount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 })
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 })
    }

    /* =========================
       🔐 VERIFY OTP (FIX FINAL)
    ========================= */
    const { data: otp } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("user_email", user_email)
      .eq("code", otp_code)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!otp) {
      return NextResponse.json(
        { error: "OTP inválido" },
        { status: 403 }
      )
    }

    const now = new Date().getTime()
    const expires = new Date(otp.expires_at).getTime()

    if (now > expires) {
      return NextResponse.json(
        { error: "OTP expirado" },
        { status: 403 }
      )
    }

    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otp.id)

    /* =========================
       🛡️ RATE LIMIT
    ========================= */
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      ""

    const rl = await rateLimit(user_email, "withdraw", ip)

    if (rl.blocked) {
      return NextResponse.json({ error: rl.reason }, { status: 429 })
    }

    logInfo("Payout request iniciado", { user_email, campaign_id, amount })

    /* =========================
       🔒 LOCK
    ========================= */
    const lockKey = crypto.createHash("md5").update(campaign_id).digest("hex")
    await supabase.rpc("advisory_lock", { lock_key: lockKey })

    /* =========================
       📌 CAMPAÑA
    ========================= */
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, user_email")
      .eq("id", campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ error: "campaña no encontrada" }, { status: 404 })
    }

    if (campaign.user_email !== user_email) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 })
    }

    /* =========================
       🪪 KYC (SE MANTIENE)
    ========================= */
    const { data: kyc } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_email", user_email)
      .maybeSingle()

    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json({ error: "KYC requerido" }, { status: 403 })
    }

    /* =========================
       🏦 BANK
    ========================= */
    const { data: bank } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_email", user_email)
      .limit(1)

    if (!bank || bank.length === 0) {
      return NextResponse.json({ error: "Agrega cuenta bancaria" }, { status: 400 })
    }

    /* =========================
       🚫 DUPLICADOS
    ========================= */
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

    /* =========================
       💰 BALANCE REAL (LEDGER)
    ========================= */
    const walletCalc = await calculateCampaignBalance(supabase, campaign_id)

    if (!walletCalc || typeof walletCalc.available !== "number") {
      return NextResponse.json({ error: "error balance" }, { status: 500 })
    }

    if (numericAmount > walletCalc.available) {
      return NextResponse.json(
        { error: "saldo insuficiente" },
        { status: 400 }
      )
    }

    /* =========================
       💸 CREAR RETIRO
    ========================= */
    const { data, error } = await supabase
      .from("payouts")
      .insert({
        campaign_id,
        user_email,
        amount: numericAmount,
        status: "pending",
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    /* =========================
       🧾 LEDGER (PENDING)
    ========================= */
    await supabase.from("financial_ledger").insert({
      campaign_id,
      user_email,
      amount: -Math.abs(numericAmount),
      type: "withdraw_pending",
      flow_type: "out",
      payment_id: `pending_${data.id}`,
      created_at: new Date().toISOString()
    })

    /* =========================
       📢 LOGS + NOTIFICACIÓN
    ========================= */
    await logToDB("info", "payout_requested", {
      campaign_id,
      amount: numericAmount,
      user_email
    })

    await sendNotification({
      user_email,
      type: "payout_requested",
      title: "Retiro en revisión",
      message: `Tu solicitud de retiro por $${numericAmount} fue enviada`,
      metadata: { campaign_id, amount: numericAmount },
      sendEmail: true
    })

    return NextResponse.json({ ok: true, payout: data })

  } catch (error) {

    logError("PAYOUT REQUEST ERROR", error)
    await logErrorToDB("payout_request_error", error)

    await sendAlert({
      title: "Error payout",
      message: "Fallo solicitud",
      data: { error }
    })

    return NextResponse.json(
      { error: "error payout" },
      { status: 500 }
    )
  }
}