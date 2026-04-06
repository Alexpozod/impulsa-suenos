import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/* =========================
   🔐 CLIENT (SERVICE ROLE)
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   🚀 UPDATE KYC (ADMIN)
========================= */
export async function POST(req: Request) {
  try {

    /* =========================
       🔐 AUTH HEADER
    ========================= */
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: "invalid session" }, { status: 401 })
    }

    /* =========================
       👑 VALIDAR ADMIN (DB REAL)
    ========================= */
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    /* =========================
       📦 BODY
    ========================= */
    const { user_email, status } = await req.json()

    if (!user_email || !status) {
      return NextResponse.json({ error: "missing data" }, { status: 400 })
    }

    /* =========================
       🔒 VALIDAR STATUS
    ========================= */
    const allowedStatus = ["pending", "approved", "rejected"]

    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 })
    }

    /* =========================
       🛡️ UPDATE KYC
    ========================= */
    const { error } = await supabase
      .from("kyc")
      .update({
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq("user_email", user_email)

    if (error) {
      console.error("KYC UPDATE ERROR:", error)
      return NextResponse.json({ error: "update failed" }, { status: 500 })
    }

    /* =========================
       📊 RESPONSE
    ========================= */
    return NextResponse.json({
      ok: true,
      message: `KYC actualizado a ${status}`
    })

  } catch (err) {
    console.error("ADMIN KYC ERROR:", err)

    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    )
  }
}