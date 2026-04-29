import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🔎 VALIDACIONES GLOBALES
========================= */

function validateIBAN(iban: string) {
  return /^[A-Z0-9]{15,34}$/.test(iban.replace(/\s/g, ""))
}

function validateSWIFT(swift: string) {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift)
}

function validateRut(rut: string) {
  if (!rut || !rut.includes("-")) return false

  const [num, dv] = rut.split("-")
  let suma = 0
  let multiplo = 2

  for (let i = num.length - 1; i >= 0; i--) {
    suma += Number(num[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }

  const dvEsperado = 11 - (suma % 11)

  const dvFinal =
    dvEsperado === 11 ? "0" :
    dvEsperado === 10 ? "K" :
    dvEsperado.toString()

  return dvFinal === dv.toUpperCase()
}

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
    const reqBody = await req.json()

    const {
      bank_id,
      account_number,
      account_type,
      bank_name,
      holder_name,
      rut,
      swift,
      iban,
      is_default,
      otp_code,
      document_type,
      document_number
    } = reqBody

    if (!bank_id || !otp_code) {
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

    const now = Date.now()
    const created = new Date(otp.created_at).getTime()

    if (now - created > 5 * 60 * 1000) {
      return NextResponse.json({ error: "OTP expirado" }, { status: 403 })
    }

    // 🔥 marcar OTP usado
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
       🌍 VALIDACIÓN LEGAL GLOBAL
    ========================= */

    if (document_type === "rut") {
      if (!validateRut(rut)) {
        return NextResponse.json(
          { error: "RUT inválido" },
          { status: 400 }
        )
      }
    }

    if (iban && !validateIBAN(iban)) {
      return NextResponse.json(
        { error: "IBAN inválido" },
        { status: 400 }
      )
    }

    if (swift && !validateSWIFT(swift)) {
      return NextResponse.json(
        { error: "SWIFT inválido" },
        { status: 400 }
      )
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
       🧼 NORMALIZACIÓN DATOS
    ========================= */
    const cleanPayload: any = {}

    if (account_number) cleanPayload.account_number = account_number.trim()
    if (account_type) cleanPayload.account_type = account_type
    if (bank_name) cleanPayload.bank_name = bank_name.trim()
    if (holder_name) cleanPayload.holder_name = holder_name.trim()
    if (rut) cleanPayload.rut = rut.trim().toUpperCase()
    if (swift !== undefined) cleanPayload.swift = swift?.toUpperCase() || null
    if (iban !== undefined) cleanPayload.iban = iban?.replace(/\s/g, "").toUpperCase() || null
    if (is_default !== undefined) cleanPayload.is_default = is_default
    if (document_type) cleanPayload.document_type = document_type
    if (document_number) cleanPayload.document_number = document_number

    if (Object.keys(cleanPayload).length === 0) {
      return NextResponse.json({ error: "nada que actualizar" }, { status: 400 })
    }

    /* =========================
       💾 UPDATE DB
    ========================= */
    const { error } = await supabase
      .from("bank_accounts")
      .update(cleanPayload)
      .eq("id", bank_id)

    if (error) throw error

    /* =========================
       📧 NOTIFICACIÓN
    ========================= */
    await sendNotification({
      user_email,
      type: "bank_updated",
      title: "Cuenta bancaria actualizada",
      message: "Tu cuenta bancaria fue modificada correctamente",
      metadata: {
        bank_name: cleanPayload.bank_name || bank.bank_name
      },
      sendEmail: true
    })

    /* =========================
       🧾 AUDIT LOG
    ========================= */
    await supabase.from("bank_audit_logs").insert({
      user_email,
      bank_id,
      action: "update",
      metadata: cleanPayload
    })

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