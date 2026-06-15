import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAffiliateDashboard(
  affiliateId: string
) {

  const { data: affiliate } =
    await supabase
      .schema("raffles")
      .from("raffle_referrals")
      .select("*")
      .eq("id", affiliateId)
      .maybeSingle()

  if (!affiliate) {

    return {

      affiliate: null,

      stats: {

        clicks: 0,

        beginCheckout: 0,

        orders: 0,

        paidOrders: 0,

        revenue: 0,

        estimatedCommission: 0,

        paidCommission: 0

      }

    }

  }

  const affiliateCode =
    String(
      affiliate.code || ""
    ).toUpperCase()

  const { data: events } =
    await supabase
      .schema("raffles")
      .from("analytics_events")
      .select("*")

  const { data: ledger } =
    await supabase
      .schema("raffles")
      .from("ledger")
      .select("*")
      .eq(
        "type",
        "affiliate_commission"
      )
      .contains(
        "metadata",
        {
          affiliateId
        }
      )

  let clicks = 0
  let beginCheckout = 0
  let orders = 0
  let paidOrders = 0
  let revenue = 0

  for (const event of events || []) {

    const metadata =
      (event.metadata || {}) as any

    const code =
      String(
        metadata.affiliateCode || ""
      ).toUpperCase()

    if (code !== affiliateCode) {

      continue

    }

    switch (event.event_type) {

      case "page_view":

        clicks++

        break

      case "begin_checkout":

        beginCheckout++

        break

      case "affiliate_conversion":

        orders++

        break

      case "payment_success":

        paidOrders++

        revenue += Number(
          metadata.amount ||
          metadata.total ||
          0
        )

        break

    }

  }

  const paidCommission =
    (ledger || []).reduce(

      (sum: number, row: any) =>

        sum +

        Math.abs(
          Number(
            row.amount_clp || 0
          )
        ),

      0

    )

  const estimatedCommission =
    Math.round(

      revenue *

      Number(
        affiliate.commission_percent || 0
      ) /

      100

    )

  return {

    affiliate: {

      id:
        affiliate.id,

      code:
        affiliate.code,

      email:
        affiliate.owner_email,

      commissionPercent:
        Number(
          affiliate.commission_percent
        ),

      active:
        affiliate.active

    },

    stats: {

      clicks,

      beginCheckout,

      orders,

      paidOrders,

      revenue,

      estimatedCommission,

      paidCommission

    }

  }

}