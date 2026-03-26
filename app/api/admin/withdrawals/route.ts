import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📥 OBTENER RETIROS
export async function GET() {
  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: "Error cargando retiros" },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// ✅ APROBAR / ❌ RECHAZAR
export async function POST(req: Request) {
  try {
    const { id, action } = await req.json()

    if (!id || !action) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    // 🔍 1. OBTENER RETIRO
    const { data: withdrawal, error: findError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .single()

    if (findError || !withdrawal) {
      return NextResponse.json(
        { error: "Retiro no encontrado" },
        { status: 404 }
      )
    }

    // 🚫 2. EVITAR DOBLE PROCESO
    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Retiro ya procesado" },
        { status: 400 }
      )
    }

    // =========================
    // ✅ APROBAR RETIRO
    // =========================
    if (action === "approve") {

      // 💰 1. DESCONTAR WALLET
      const { error: walletError } = await supabase.rpc("subtract_balance", {
        user_email_input: withdrawal.user_email,
        amount_input: withdrawal.amount
      })

      if (walletError) {
        console.error("❌ Error descontando saldo:", walletError)

        return NextResponse.json(
          { error: "Error descontando saldo" },
          { status: 500 }
        )
      }

      // 📤 2. ACTUALIZAR ESTADO
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", id)

      if (updateError) {
        return NextResponse.json(
          { error: "Error aprobando retiro" },
          { status: 500 }
        )
      }

      // 🧾 3. REGISTRAR TRANSACCIÓN (LEDGER)
      await supabase.from("transactions").insert({
        user_email: withdrawal.user_email,
        type: "withdrawal",
        amount: withdrawal.amount,
        status: "completed",
        reference_id: withdrawal.id
      })

      console.log("✅ RETIRO APROBADO:", id)

      return NextResponse.json({ ok: true })
    }

    // =========================
    // ❌ RECHAZAR RETIRO
    // =========================
    if (action === "reject") {

      // 💰 1. DEVOLVER DINERO
      const { error: walletError } = await supabase.rpc("add_balance", {
        user_email_input: withdrawal.user_email,
        amount_input: withdrawal.amount
      })

      if (walletError) {
        console.error("❌ Error devolviendo saldo:", walletError)

        return NextResponse.json(
          { error: "Error devolviendo saldo" },
          { status: 500 }
        )
      }

      // 📤 2. ACTUALIZAR ESTADO
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", id)

      if (updateError) {
        return NextResponse.json(
          { error: "Error actualizando retiro" },
          { status: 500 }
        )
      }

      // 🧾 3. REGISTRAR TRANSACCIÓN
      await supabase.from("transactions").insert({
        user_email: withdrawal.user_email,
        type: "refund",
        amount: withdrawal.amount,
        status: "completed",
        reference_id: withdrawal.id
      })

      console.log("❌ RETIRO RECHAZADO:", id)

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json(
      { error: "Acción inválida" },
      { status: 400 }
    )

  } catch (error) {
    console.error("❌ ERROR ADMIN:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
