import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function loadAffiliateFromOrder(
  order_id: string
) {

  const { data: order } =
    await supabase
      .schema("raffles")
      .from("orders")
      .select("id, metadata")
      .eq("id", order_id)
      .maybeSingle()

  if (!order) {

    return null

  }

  const metadata =
    (order.metadata || {}) as any

  const tracking =
    metadata.tracking || {}

  /*
  =====================================

  Nuevo modelo comercial.

  commercialCode es la fuente de verdad.

  Compatibilidad para órdenes antiguas.

  =====================================
  */

  const commercialCode =

    tracking.commercialCode ??

    tracking.affiliateCode ??

    tracking.couponCode ??

    tracking.referralCode ??

    null

  return {

    commercialCode,

    metadata

}

}