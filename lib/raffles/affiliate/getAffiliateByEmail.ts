import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAffiliateByEmail(

  email: string

){

  const {

    data,

    error

  } =
  await supabase
    .schema("raffles")
    .from("raffle_referrals")
    .select("*")
    .eq(
      "owner_email",
      email.toLowerCase()
    )
    .maybeSingle()

  if(error){

    throw error

  }

  return data

}