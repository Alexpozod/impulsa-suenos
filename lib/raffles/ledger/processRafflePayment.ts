import { createClient }
from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processRafflePayment({

  payment_id,
  raffle_id,
  order_id,
  amount,
  provider_fee = 0

}: {

  payment_id: string
  raffle_id: string
  order_id: string
  amount: number
  provider_fee?: number

}) {

  const platformFee =
    amount * 0.10

  const iva =
    platformFee * 0.19

  const net =
    amount -
    provider_fee -
    platformFee -
    iva

  const entries = [

    {
      raffle_id,
      payment_id,
      order_id,

      entry_type: "payment",
      flow_type: "in",

      amount,

      provider: "flow",

      status: "confirmed"
    },

    {
      raffle_id,
      payment_id,
      order_id,

      entry_type: "provider_fee",
      flow_type: "out",

      amount: provider_fee,

      provider: "flow",

      status: "confirmed"
    },

    {
      raffle_id,
      payment_id,
      order_id,

      entry_type: "platform_fee",
      flow_type: "out",

      amount: platformFee,

      provider: "platform",

      status: "confirmed"
    },

    {
      raffle_id,
      payment_id,
      order_id,

      entry_type: "iva",
      flow_type: "out",

      amount: iva,

      provider: "sii",

      status: "confirmed"
    },

    {
      raffle_id,
      payment_id,
      order_id,

      entry_type: "net_income",
      flow_type: "in",

      amount: net,

      provider: "platform",

      status: "confirmed"
    }

  ]

  await supabase
    .schema("raffles")
    .from("financial_ledger")
    .insert(entries)

  return {
    platformFee,
    iva,
    net
  }
}