import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAffiliateOrders(){

  const {
    data,
    error
  } =
  await supabase
    .schema("raffles")
    .from("orders")
    .select(`
      id,
      raffle_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      quantity,
      total_clp,
      status,
      created_at,
      metadata,
      raffles(
        id,
        title,
        slug
      )
    `)

  if(error){

    throw error

  }

  return data || []

}