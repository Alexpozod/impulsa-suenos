import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createAffiliatePayoutRequest({

  affiliateId,

  amount

}:{

  affiliateId:string

  amount:number

}){

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("affiliate_payout_requests")
      .insert({

        affiliate_id:
          affiliateId,

        amount_clp:
          amount,

        status:
          "pending"

      })

      .select()

      .single()

  if(error){

    throw error

  }

  return data

}