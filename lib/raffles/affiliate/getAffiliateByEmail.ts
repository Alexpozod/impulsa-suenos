import {
  supabaseAdmin
} from "@/lib/raffles/supabase/admin"

export async function getAffiliateByEmail(

  email: string

){

  const {

    data,

    error

  } =
  await supabaseAdmin
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