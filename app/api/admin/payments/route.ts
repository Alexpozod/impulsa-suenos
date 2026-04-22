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

    let data = null

    /* =========================
       1️⃣ BUSCAR EN payment_logs (CLAVE)
    ========================= */
    const logs = await supabase
      .from("payment_logs")
      .select("*")
      .eq("payment_id", id)
      .maybeSingle()

    if (logs.data) {
      data = {
        ...logs.data,
        source: "payment_logs"
      }
    }

    /* =========================
       2️⃣ BUSCAR EN payment_events
    ========================= */
    if (!data) {
      const events = await supabase
        .from("payment_events")
        .select("*")
        .eq("payment_id", id)
        .maybeSingle()

      if (events.data) {
        data = {
          ...events.data,
          source: "payment_events"
        }
      }
    }

    /* =========================
       3️⃣ BUSCAR EN financial_ledger
    ========================= */
    if (!data) {
      const ledger = await supabase
        .from("financial_ledger")
        .select("*")
        .eq("reference_id", id)
        .maybeSingle()

      if (ledger.data) {
        data = {
          ...ledger.data,
          source: "ledger"
        }
      }
    }

    /* =========================
       4️⃣ payments (por si acaso)
    ========================= */
    if (!data) {
      const payments = await supabase
        .from("payments")
        .select("*")
        .or(`id.eq.${id},external_id.eq.${id},mp_payment_id.eq.${id}`)
        .maybeSingle()

      if (payments.data) {
        data = {
          ...payments.data,
          source: "payments"
        }
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