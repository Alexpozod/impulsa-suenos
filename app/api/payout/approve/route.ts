import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { payout_id } = await req.json()

    if (!payout_id) {
      return NextResponse.json(
        { error: "payout_id requerido" },
        { status: 400 }
      )
    }

    // 1. obtener payout
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .single()

    if (payoutError || !payout) {
      return NextResponse.json(
        { error: "payout no encontrado" },
        { status: 404 }
      )
    }

    // 2. evitar doble pago
    if (payout.status === "paid") {
      return NextResponse.json(
        { error: "payout ya procesado" },
        { status: 400 }
      )
    }

    // 3. actualizar payout a pagado
    const { error: updateError } = await supabase
      .from("payouts")
      .update({
        status: "paid",
        processed_at: new Date().toISOString()
      })
      .eq("id", payout_id)

    if (updateError) {
      return NextResponse.json(
        { error: "error actualizando payout" },
        { status: 500 }
      )
    }

    // 4. registrar en ledger (SALIDA REAL)
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        campaign_id: payout.campaign_id,
        amount: payout.amount,
        type: "withdraw",
        status: "confirmed"
      })

    if (ledgerError) {
      // 🔴 compensación básica (rollback lógico)
      await supabase
        .from("payouts")
        .update({ status: "pending" })
        .eq("id", payout_id)

      return NextResponse.json(
        { error: "error registrando ledger" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      payout_id,
      status: "paid"
    })

  } catch (error) {
    return NextResponse.json(
      { error: "error approve payout" },
      { status: 500 }
    )
  }
}
