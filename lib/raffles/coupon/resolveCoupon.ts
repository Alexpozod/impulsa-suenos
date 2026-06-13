import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CouponResult {

  found: boolean

  id?: string

  code?: string

  discountType?: "fixed" | "percentage"

  discountValue?: number

  discountAmount?: number

}

export async function resolveCoupon(

  couponCode?: string | null,

  subtotal: number = 0

): Promise<CouponResult> {

  if (!couponCode) {

    return {

      found: false

    }

  }

  const now = new Date().toISOString()

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("business_rules")
      .select("*")
      .eq("type", "coupon")
      .eq("active", true)
      .eq("code", couponCode)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .maybeSingle()

  if (error || !data) {

    return {

      found: false

    }

  }

  let discountAmount = 0

  if (data.value_type === "percentage") {

    discountAmount =
      subtotal * (Number(data.value) / 100)

  }

  else if (data.value_type === "fixed") {

    discountAmount =
      Number(data.value)

  }

  return {

    found: true,

    id: data.id,

    code: data.code,

    discountType: data.value_type,

    discountValue: Number(data.value),

    discountAmount

  }

}