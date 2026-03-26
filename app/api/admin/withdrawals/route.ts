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

// ✅ APROBAR / ❌ RECHAZAR (SEGURO)
export async function POST(req: Request) {
  try {
    const { withdrawalId, action, adminEmail, reason } = await req.json()

    // 🚨 Validación básica
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

    // 🔐 Validar admin
    const { data: admin, error: adminError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", adminEmail)
      .single()

    if (adminError || !admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // 🔥 LLAMADA RPC SEGURA
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
