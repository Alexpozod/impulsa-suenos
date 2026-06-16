import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function calculateAffiliateWallet(

  affiliateId: string

) {

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("ledger")
      .select(
        "type,amount_clp,status"
      )
      .contains(
        "metadata",
        {
          affiliateId
        }
      )

  if (error || !data) {

    return {

      generated: 0,

      available: 0,

      paid: 0,

      pending: 0

    }

  }

  let generated = 0
    let paid = 0
    let pending = 0

  for (const row of data) {

    const amount =
      Math.abs(
        Number(
          row.amount_clp || 0
        )
      )

    if (
      row.type ===
      "affiliate_commission"
    ) {

      generated += amount

    }

    if (
      row.type ===
      "affiliate_payout"
    ) {

      paid += amount

    }

  }

  const {

  data: pendingRequests

} = await supabase
  .schema("raffles")
  .from(
    "affiliate_payout_requests"
  )
  .select(
    "amount_clp"
  )
  .eq(
    "affiliate_id",
    affiliateId
  )
  .eq(
    "status",
    "pending"
  )

pending =
  (pendingRequests ?? [])
    .reduce(

      (
        sum:number,
        row:any
      ) =>

        sum +

        Math.abs(

          Number(
            row.amount_clp || 0
          )

        ),

      0

    )

  const available =
  Math.max(
    generated -
    paid -
    pending,
    0
  )

  return {

  generated,

  paid,

  pending,

  available

}

}