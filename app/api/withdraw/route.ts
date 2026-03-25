import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, amount } = await req.json()

    console.log("💸 WITHDRAW REQUEST:", { email, amount })

    // 🚨 Validación básica
    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // 💰 Obtener wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_email", email)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet no encontrada" },
        { status: 404 }
      )
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      )
    }

    // 💸 Descontar saldo (CLAVE)
    const { error: updateError } = await supabase
      .from("wallets")
      .update({
        balance: wallet.balance - amount
      })
      .eq("user_email", email)

    if (updateError) {
      console.error("❌ Error actualizando wallet:", updateError)

      return NextResponse.json(
        { error: "Error procesando retiro" },
        { status: 500 }
      )
    }

    // 📤 Crear solicitud de retiro
    const { error: withdrawError } = await supabase
      .from("withdrawals")
      .insert({
        user_email: email,
        amount,
        status: "pending"
      })

    if (withdrawError) {
      console.error("❌ Error creando retiro:", withdrawError)
    }

    console.log("✅ RETIRO CREADO")

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
