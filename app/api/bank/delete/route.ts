import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { logError, logInfo } from "@/lib/logger-api"
import { logToDB, logErrorToDB } from "@/lib/logToDB"
import { sendAlert } from "@/lib/alerts/sendAlert"
import { sendNotification } from "@/lib/notifications/sendNotification" // 🔥 NUEVO

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🧠 VALIDACIÓN RUT CHILE
========================= */
function validateRUT(rut: string) {
  try {
    const clean = rut.replace(/\./g, "").replace("-", "").toUpperCase()
    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)

    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const expectedDV = 11 - (sum % 11)
    const dvFinal =
      expectedDV === 11 ? "0" :
      expectedDV === 10 ? "K" :
      expectedDV.toString()

    return dvFinal === dv
  } catch {
    return false
  }
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
    const body = await req.json()
    const { bank_id, otp_code } = body

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
       🇨🇱 VALIDACIÓN RUT SI APLICA
    ========================= */
    if (bank.document_type === "rut" && bank.rut) {
      const isValid = validateRUT(bank.rut)
      if (!isValid) {
        return NextResponse.json(
          { error: "RUT inválido (seguridad)" },
          { status: 400 }
        )
      }
    }

    /* =========================
       🔒 BLOQUEO POR RETIRO
    ========================= */
    const { data: pending } = await supabase
      .from("payouts")
      .select("id")
      .eq("user_email", user_email)
      .eq("status", "pending")
      .limit(1)

    if (pending && pending.length > 0) {
      return NextResponse.json(
        { error: "Tienes retiros en proceso. No puedes eliminar esta cuenta." },
        { status: 400 }
      )
    }

    /* =========================
       🚫 NO ELIMINAR ÚLTIMA CUENTA
    ========================= */
    const { data: allAccounts } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_email", user_email)

    if (allAccounts && allAccounts.length <= 1) {
      return NextResponse.json(
        { error: "Debes tener al menos una cuenta bancaria" },
        { status: 400 }
      )
    }

    /* =========================
       🧠 SI ERA PRINCIPAL → REASIGNAR
    ========================= */
    if (bank.is_default) {
      const { data: other } = await supabase
        .from("bank_accounts")
        .select("id")
        .eq("user_email", user_email)
        .neq("id", bank_id)
        .limit(1)
        .maybeSingle()

      if (other) {
        await supabase
          .from("bank_accounts")
          .update({ is_default: true })
          .eq("id", other.id)
      }
    }

    /* =========================
       🚫 ELIMINAR
    ========================= */
    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", bank_id)

    if (error) throw error

    /* =========================
       📧 NOTIFICACIÓN USUARIO
    ========================= */
    await sendNotification({
      user_email,
      type: "bank_deleted",
      title: "Cuenta bancaria eliminada",
      message: "Eliminaste una cuenta bancaria de tu perfil",
      metadata: {
        bank_name: bank.bank_name
      },
      sendEmail: true
    })

    /* =========================
       📜 AUDITORÍA
    ========================= */
    await supabase.from("bank_audit_logs").insert({
      user_email,
      bank_id,
      action: "delete",
      metadata: {
        bank_name: bank.bank_name,
        account_last4: bank.account_number?.slice(-4)
      }
    })

    /* =========================
       📢 LOGS
    ========================= */
    await logToDB("info", "bank_deleted", {
      user_email,
      bank_id
    })

    logInfo("Bank deleted", { user_email, bank_id })

    return NextResponse.json({ ok: true })

  } catch (error) {

    logError("BANK DELETE ERROR", error)
    await logErrorToDB("bank_delete_error", error)

    await sendAlert({
      title: "Error bank delete",
      message: "Fallo eliminación cuenta bancaria",
      data: { error }
    })

    return NextResponse.json(
      { error: "error delete bank" },
      { status: 500 }
    )
  }
}