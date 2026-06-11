import { createClient } from "@supabase/supabase-js"
import { AffiliateResult } from "./types"
import { normalizeAffiliateCode } from "./normalizeAffiliateCode"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function resolveAffiliate(
  affiliateCode?: string | null
): Promise<AffiliateResult> {

  const normalized =
    normalizeAffiliateCode(
      affiliateCode
    )

  if (!normalized) {

    return {
      found: false
    }

  }

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("raffle_referrals")
      .select("*")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle()

  if (error || !data) {

    return {
      found: false
    }

  }

  return {

    found: true,

    affiliateId:
      data.id,

    affiliateCode:
      data.code,

    affiliateName:
      data.owner_email,

    commissionType:
      "percentage",

    commissionValue:
      Number(
        data.commission_percent
      ),

    commissionAmount:
      0

  }

}