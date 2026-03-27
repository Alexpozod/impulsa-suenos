import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 📥 OBTENER RETIROS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ ERROR GET WITHDRAWALS:", error)

      return NextResponse.json(
        { error: "Error cargando retiros" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (err) {
    console.error("❌ ERROR GENERAL GET:", err)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}

// ✅ APROBAR / ❌ RECHAZAR (SEGURO)
export async function POST(req: Request) {
  try {
    const { withdrawalId, action, adminEmail, reason } = await req.json()

    // 🚨 Validación fuerte
    if (!withdrawalId || !action || !adminEmail) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Acción inválida" },
        { status: 400 }
      )
    }

    // 🔐 Validar admin REAL
    const { data: admin, error: adminError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", adminEmail)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Admin no encontrado" },
        { status: 404 }
      )
    }

    if (admin.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // 🔥 VALIDAR QUE EL RETIRO EXISTE (extra seguridad)
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("id, status")
      .eq("id", withdrawalId)
      .single()

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Retiro no encontrado" },
        { status: 404 }
      )
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: "Retiro ya procesado" },
        { status: 400 }
      )
    }

    // 🔥 LLAMADA RPC SEGURA (LÓGICA EN DB)
    const { data, error } = await supabase.rpc("process_withdraw", {
      p_withdrawal_id: withdrawalId,
      p_action: action,
      p_admin_id: admin.id,
      p_reason: reason || null
    })

    if (error) {
      console.error("❌ RPC ERROR:", error)

      return NextResponse.json(
        { error: "Error procesando retiro" },
        { status: 500 }
      )
    }

    if (data?.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("❌ ERROR ADMIN:", error)

    return NextResponse.json(
      { error: "Error servidor" },
      { status: 500 }
    )
  }
}
