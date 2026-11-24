import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const expectedTypes = [
  "payment", "fee_provider", "platform_fee", "platform_fee_iva", "creator_net"
]

async function assertLedgerCompleteness(paymentId: string) {
  const { data, error } = await supabase.schema("raffles")
    .from("ledger").select("type")
    .eq("payment_id", paymentId)
    .in("type", expectedTypes)
  if (error) throw error
  const types = new Set((data || []).map(row => row.type))
  if (types.size === 0) return false
  if (expectedTypes.some(type => !types.has(type))) {
    throw new Error("raffles_payment_ledger_incomplete")
  }
  return true
}

export async function processRafflePayment({
  payment_id, raffle_id, order_id, amount, provider_fee
}: {
  payment_id: string
  raffle_id: string
  order_id: string
  amount: number
  provider_fee: number
}) {
  if (!Number.isFinite(amount) || amount < 0 ||
      !Number.isFinite(provider_fee) || provider_fee < 0) {
    throw new Error("raffles_invalid_ledger_amount")
  }

  if (await assertLedgerCompleteness(payment_id)) return

  const platformFee = amount * 0.10
  const iva = platformFee * 0.19
  const creatorNet = amount - provider_fee - platformFee - iva

  const rows = [
    { type: "payment", flow_type: "in", amount_clp: amount },
    { type: "fee_provider", flow_type: "out", amount_clp: -provider_fee },
    { type: "platform_fee", flow_type: "out", amount_clp: -platformFee },
    { type: "platform_fee_iva", flow_type: "out", amount_clp: -iva },
    { type: "creator_net", flow_type: "out", amount_clp: -creatorNet }
  ].map(row => ({
    ...row, raffle_id, order_id, payment_id, status: "confirmed"
  }))

  const { error } = await supabase.schema("raffles").from("ledger").insert(rows)

  if (error) {
    // A parallel replay may insert the same unique (payment_id, type) values.
    if (error.code === "23505" && await assertLedgerCompleteness(payment_id)) return
    console.error("raffles_ledger_creation_failed", error.code)
    throw new Error("raffles_ledger_creation_failed")
  }

  // Do not mark a payment fully processed unless all financial rows exist.
  if (!(await assertLedgerCompleteness(payment_id))) {
    throw new Error("raffles_payment_ledger_missing")
  }
}
