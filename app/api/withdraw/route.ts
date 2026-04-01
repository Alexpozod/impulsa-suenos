import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { securityGuard } from "@/lib/security/guard"
import { rateLimit } from "@/lib/security/rateLimit"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { amount, otp } = await req.json()

    if (!amount || amount <= 0 || !otp) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    /* =========================
       🔐 AUTH
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (!user || error) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    const email = user.email!
    const userId = user.id
    const orgId = user.user_metadata?.organization_id

    if (!orgId) {
      return NextResponse.json({ error: "no organization" }, { status: 403 })
    }

    /* =========================
       🚫 BLOQUEO POR CAMPAÑA
    ========================= */
    const { data: blockedCampaign } = await supabaseAdmin
      .from("campaigns")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "blocked")
      .maybeSingle()

    if (blockedCampaign) {
      return NextResponse.json(
        { error: "Cuenta bloqueada por seguridad" },
        { status: 403 }
      )
    }

    /* =========================
       RATE LIMIT + FRAUDE
    ========================= */
    const limit = await rateLimit(email, "withdraw")
    if (limit.blocked) {
      return NextResponse.json({ error: limit.reason }, { status: 429 })
    }

    const fraud = await securityGuard(email)
    if (fraud.isDanger) {
      return NextResponse.json(
        { error: "Cuenta bloqueada por actividad sospechosa" },
        { status: 403 }
      )
    }

    /* =========================
       DEVICE LOG
    ========================= */
    await supabaseAdmin.from("user_devices").insert({
      user_id: userId,
      organization_id: orgId,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown"
    })

    /* =========================
       LOCK + RPC
    ========================= */
    await supabaseAdmin.rpc("advisory_lock", {
      lock_key: userId
    })

    const { data, error: rpcError } = await supabaseAdmin.rpc("request_withdraw", {
      p_user_id: userId,
      p_amount: amount,
      p_otp_code: otp
    })

    if (rpcError) {
      return NextResponse.json({ error: "Error retiro" }, { status: 500 })
    }

    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    return NextResponse.json({ error: "Error servidor" }, { status: 500 })
  }
}