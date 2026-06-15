import { createClient } from "@supabase/supabase-js"

const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function findReferralByCode(

  code?: string | null

){

  if(!code){

    return null

  }

  const normalized =

    code

      .trim()

      .toUpperCase()

  const { data } =

    await supabase

      .schema("raffles")

      .from("referrals")

      .select("*")

      .eq(

        "code",

        normalized

      )

      .eq(

        "active",

        true

      )

      .maybeSingle()

  if(!data){

    return null

  }

  return{

  id:
    data.id,

  code:
    data.code,

  email:
    data.owner_email,

  rewardType:
    data.reward_type,

  rewardValue:
    Number(
      data.reward_value
    )

}

}