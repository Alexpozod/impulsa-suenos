import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"

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
       📥 INPUT
    ========================= */
    const body = await req.json()

    const {
      bank_id,
      account_number,
      account_type,
      bank_name,
      holder_name,
      rut,
      country,
      swift,
      iban,
      is_default,
      otp_code
    } = body

    if (!bank_id || !account_number || !account_type || !bank_name || !otp_code) {
      return NextResponse.json({ error: "datos incompletos" }, { status: 400 })
    }

    /* =========================
       🔐 OTP VERIFY
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
      return NextResponse.json({ error: "OTP inválido" }, { status: 403 })
    }

    const now = new Date().getTime()
    const created = new Date(otp.created_at).getTime()

    if (now - created > 5 * 60 * 1000) {
      return NextResponse.json({ error: "OTP expirado" }, { status: 403 })
    }

    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otp.id)

    /* =========================
       🔍 VALIDAR PROPIEDAD
    ========================= */
    const { data: bank } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("id", bank_id)
      .maybeSingle()

    if (!bank || bank.user_email !== user_email) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 })
    }

    /* =========================
       ⭐ SET DEFAULT
    ========================= */
    if (is_default === true) {
      await supabase
        .from("bank_accounts")
        .update({ is_default: false })
        .eq("user_email", user_email)
    }

    /* =========================
       💾 UPDATE
    ========================= */
    const { error } = await supabase
      .from("bank_accounts")
      .update({
        holder_name: holder_name ?? bank.holder_name,
        bank_name,
        account_number,
        account_type,
        country: country ?? bank.country,
        rut: rut ?? bank.rut,
        swift: swift ?? bank.swift,
        iban: iban ?? bank.iban,
        is_default: is_default ?? bank.is_default,
        updated_at: new Date().toISOString()
      })
      .eq("id", bank_id)

    if (error) throw error

    /* =========================
       📜 AUDITORÍA
    ========================= */
    await supabase.from("bank_audit_logs").insert({
      user_email,
      bank_id,
      action: "update",
      metadata: {
        bank_name,
        account_type,
        is_default
      }
    })

    /* =========================
       📢 LOGS
    ========================= */
    await logToDB("info", "bank_updated", {
      user_email,
      bank_id
    })

    logInfo("Bank updated", { user_email, bank_id })

    return NextResponse.json({ ok: true })

  } catch (error) {

    logError("BANK UPDATE ERROR", error)
    await logErrorToDB("bank_update_error", error)

    await sendAlert({
      title: "Error bank update",
      message: "Fallo actualización cuenta bancaria",
      data: { error }
    })

    return NextResponse.json(
      { error: "error update bank" },
      { status: 500 }
    )
  }
}