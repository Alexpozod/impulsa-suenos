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
        .limit(1)

    if (
      alreadyExists.data &&
      alreadyExists.data.length > 0
    ) {
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

          amount,

          status: "confirmed"
        },

        {
          raffle_id,

          order_id,

          payment_id,

          type: "fee_provider",

          flow_type: "out",

          amount: -provider_fee,

          status: "confirmed"
        },

        {
          raffle_id,

          order_id,

          payment_id,

          type: "platform_fee",

          flow_type: "out",

          amount: -platformFee,

          status: "confirmed"
        },

        {
          raffle_id,

          order_id,

          payment_id,

          type: "platform_fee_iva",

          flow_type: "out",

          amount: -iva,

          status: "confirmed"
        },

        {
          raffle_id,

          order_id,

          payment_id,

          type: "creator_net",

          flow_type: "out",

          amount: -creatorNet,

          status: "confirmed"
        }

      ])

  } catch (error) {

    console.error(
      "processRafflePayment error",
      error
    )
  }
}