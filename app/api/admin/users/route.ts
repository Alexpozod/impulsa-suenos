import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* =========================
   📥 GET USERS
========================= */
export async function GET() {
  try {

    /* =========================
       👥 USERS
    ========================= */
    const { data: users, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        role,
        created_at,
        full_name,
        phone,
        kyc_status
      `)
      .order("created_at", {
        ascending: false
      })

    if (error) throw error

    /* =========================
       🏦 BANK ACCOUNTS
    ========================= */
    const { data: bankAccounts } = await supabase
      .from("bank_accounts")
      .select(`
        user_email,
        bank_name,
        account_number,
        account_type,
        holder_name,
        rut,
        is_default
      `)

    /* =========================
       🧠 MAP CUENTAS
    ========================= */
    const bankMap = Object.fromEntries(
      (bankAccounts || []).map((b) => [
        b.user_email?.toLowerCase(),
        {
          bank_name: b.bank_name,
          account_number: b.account_number,
          account_type: b.account_type,
          holder_name: b.holder_name,
          rut: b.rut
        }
      ])
    )

    /* =========================
       🔥 COMBINAR
    ========================= */
    const finalUsers = (users || []).map((u) => {

      const bank =
        bankMap[u.email?.toLowerCase()] || {}

      return {
        ...u,
        ...bank
      }

    })

    return NextResponse.json(finalUsers)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "error fetching users" },
      { status: 500 }
    )

  }
}
  
/* =========================
   🔄 UPDATE ROLE
========================= */
export async function POST(req: Request) {
  try {

    const { user_id, role } = await req.json()

    if (!user_id || !role) {
      return NextResponse.json(
        { error: "missing data" },
        { status: 400 }
      )
    }

    if (!["admin", "contador", "user"].includes(role)) {
      return NextResponse.json(
        { error: "invalid role" },
        { status: 400 }
      )
    }

    /* 🚨 NO PERMITIR QUEDARSE SIN ADMINS */

const { data: currentUser } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user_id)
  .single()

if (
  currentUser?.role === "admin" &&
  role !== "admin"
) {

  const { count } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("role", "admin")

  if ((count || 0) <= 1) {
    return NextResponse.json(
      {
        error: "No puedes eliminar el último admin"
      },
      { status: 400 }
    )
  }
}

    await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user_id)

    /* 🧾 AUDITORÍA */
    await supabase.from("audit_logs").insert({
      action: "update_role",
      entity: "user",
      entity_id: user_id,
      metadata: { role },
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "update error" },
      { status: 500 }
    )
  }
}