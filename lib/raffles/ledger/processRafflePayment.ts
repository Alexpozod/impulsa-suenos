import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processRafflePayment({

  payment_id,
  raffle_id,
  order_id,

  amount,
  provider_fee

}: {

  payment_id: string

  raffle_id: string

  order_id: string

  amount: number

  provider_fee: number

}) {

  try {

    const alreadyExists =
  await supabase
    .schema("raffles")
    .from("ledger")
    .select("id")
    .eq("payment_id", payment_id)
    .eq("type", "payment")
    .maybeSingle()

if (alreadyExists.data) {

  console.log(
    "LEDGER_ALREADY_EXISTS",
    payment_id
  )

  return
}

    const platformFee =
      amount * 0.10

    const iva =
      platformFee * 0.19

    const creatorNet =
      amount -
      provider_fee -
      platformFee -
      iva

    const { error } =
      await supabase
        .schema("raffles")
        .from("ledger")
        .insert([

          {
            raffle_id,

            order_id,

            payment_id,

            type: "payment",

            flow_type: "in",

            amount_clp: amount,

            status: "confirmed"
          },

          {
            raffle_id,

            order_id,

            payment_id,

            type: "fee_provider",

            flow_type: "out",

            amount_clp: -provider_fee,

            status: "confirmed"
          },

          {
            raffle_id,

            order_id,

            payment_id,

            type: "platform_fee",

            flow_type: "out",

            amount_clp: -platformFee,

            status: "confirmed"
          },

          {
            raffle_id,

            order_id,

            payment_id,

            type: "platform_fee_iva",

            flow_type: "out",

            amount_clp: -iva,

            status: "confirmed"
          },

          {
            raffle_id,

            order_id,

            payment_id,

            type: "creator_net",

            flow_type: "out",

            amount_clp: -creatorNet,

            status: "confirmed"
          }

        ])

    if (error) {

  console.error(
    "LEDGER INSERT ERROR",
    error
  )

  /* =========================
     DUPLICATE PROTECTION
  ========================= */

  if (
    error.code === "23505"
  ) {

    console.warn(
      "LEDGER DUPLICATE BLOCKED",
      payment_id
    )

    return
  }

  throw error
}

  } catch (error) {

    console.error(
      "processRafflePayment error",
      error
    )
  }
}