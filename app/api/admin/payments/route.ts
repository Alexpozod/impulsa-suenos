import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "id requerido" },
        { status: 400 }
      )
    }

    /* =========================
       🔥 BUSQUEDA INTELIGENTE
    ========================= */
    // 1️⃣ intentar payments
let data = null

// 1️⃣ payments (campos directos)
let res = await supabase
  .from("payments")
  .select("*")
  .or(`id.eq.${id},external_id.eq.${id},mp_payment_id.eq.${id}`)
  .limit(1)
  .maybeSingle()

if (res.data) data = res.data

// 2️⃣ buscar en financial_ledger metadata
if (!data) {
  const ledger = await supabase
    .from("financial_ledger")
    .select("*")
    .ilike("metadata::text", `%${id}%`)
    .limit(1)
    .maybeSingle()

  if (ledger.data) {
    data = {
      ...ledger.data,
      source: "ledger"
    }
  }
}

// 3️⃣ buscar en payment_logs
if (!data) {
  const logs = await supabase
    .from("payment_logs")
    .select("*")
    .ilike("data::text", `%${id}%`)
    .limit(1)
    .maybeSingle()

  if (logs.data) {
    data = {
      ...logs.data,
      source: "logs"
    }
  }
}

// 2️⃣ fallback → financial_ledger
if (!data) {
  const res = await supabase
    .from("financial_ledger")
    .select("*")
    .eq("reference_id", id)
    .limit(1)
    .maybeSingle()

  if (res.data) {
    data = res.data
  }
}

// 3️⃣ fallback → payment_logs
if (!data) {
  const res = await supabase
    .from("payment_logs")
    .select("*")
    .eq("payment_id", id)
    .limit(1)
    .maybeSingle()

  if (res.data) {
    data = res.data
  }
}
    if (!data) {
      return NextResponse.json(
        { error: "payment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (err) {

    console.error("❌ payment detail error", err)

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    )
  }
}