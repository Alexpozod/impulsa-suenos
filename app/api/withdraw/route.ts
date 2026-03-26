import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json()

    if (!email || !amount || amount <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // 🔍 Obtener usuario
    const { data: user } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = user.id

    // 🚨 VALIDAR RIESGO
    const { data: risk } = await supabase
      .from("user_risk")
      .select("status")
      .eq("user_id", userId)
      .single()

    if (risk?.status === "blocked") {
      return NextResponse.json({ error: "Usuario bloqueado" }, { status: 403 })
    }

    // 🔐 VALIDAR KYC
    const { data: kyc } = await supabase
      .from("kyc")
      .select("status")
      .eq("user_id", userId)
      .single()

    if (kyc?.status !== "approved") {
      return NextResponse.json(
        { error: "Debes completar verificación KYC" },
        { status: 403 }
      )
    }

    // 💰 Obtener wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_email", email)
      .single()

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      )
    }

    // 🚫 Validar retiros pendientes
    const { data: pending } = await supabase
      .from("withdrawals")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")

    if (pending && pending.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes un retiro pendiente" },
        { status: 400 }
      )
    }

    // 💸 Descontar saldo
    const newBalance = wallet.balance - amount

    const { error: walletError } = await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_email", email)

    if (walletError) {
      return NextResponse.json(
        { error: "Error actualizando saldo" },
        { status: 500 }
      )
    }

    // 🧾 Registrar transaction (CLAVE FINTECH)
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "withdraw",
        amount: -amount,
        status: "pending"
      })

    if (txError) {
      console.error("Error transaction:", txError)
    }

    // 📤 Crear retiro
    const { error: withdrawError } = await supabase
      .from("withdrawals")
      .insert({
        user_id: userId,
        user_email: email,
        amount,
        status: "pending"
      })

    if (withdrawError) {
      return NextResponse.json(
        { error: "Error creando retiro" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
