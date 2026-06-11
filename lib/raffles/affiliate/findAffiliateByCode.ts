import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function findAffiliateByCode(
  code?: string | null
) {

  if (!code) {

    return null

  }

  const normalized =
    code.trim().toUpperCase()

  const { data } =
    await supabase
      .schema("raffles")
      .from("raffle_referrals")
      .select("*")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle()

  if (!data) {

    return null

  }

  return {

    id: data.id,

    code: data.code,

    email: data.owner_email,

    commissionPercent:
      Number(data.commission_percent)

  }

}