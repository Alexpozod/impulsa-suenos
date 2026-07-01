import { createClient } from "@supabase/supabase-js"

import { calculateAffiliateWallet }
from "./calculateAffiliateWallet"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAffiliateDashboard(
  affiliateId: string
) {

 const {

  data: affiliate,

  error: affiliateError

} =
  await supabase
    .schema("raffles")
    .from("raffle_referrals")
    .select("*")
    .eq("id", affiliateId)
    .maybeSingle();

console.log(
  "affiliate",
  affiliate
);

console.log(
  "affiliateError",
  affiliateError
);

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

  },

  sales: []

}

  }

  const affiliateCode =
    String(
      affiliate.code || ""
    ).toUpperCase()

    /* =========================================
   ANALYTICS
========================================= */

const { data: events } =
  await supabase
    .schema("raffles")
    .from("analytics_events")
    .select("*")

/* =========================================
   ORDERS
========================================= */

const {
  data: affiliateOrders,
  error: ordersError
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
  `);

/* =========================================
   PAYMENTS
========================================= */

const { data: affiliatePayments } =
  await supabase
    .schema("raffles")
    .from("payments")
    .select(`
      id,
      order_id,
      provider,
      provider_payment_id,
      amount_clp,
      status,
      created_at
    `)

/* =========================================
   LEDGER
========================================= */

const { data: ledger } =
await supabase
.schema("raffles")
.from("ledger")
.select(`
id,
created_at,
type,
amount_clp,
status,
metadata
`)
.eq(
"type",
"affiliate_commission"
)
.order(
"created_at",
{
ascending:false
}
)
    
const ledgerEntries =
(ledger || [])
.filter((entry:any)=>{

const metadata =
(entry.metadata || {}) as any

return metadata.affiliateId===affiliateId

})

.map((entry:any)=>{

const metadata =
(entry.metadata || {}) as any

const orderId =
metadata.orderId ??
metadata.order_id ??
metadata.order ??
metadata.orderUUID ??
null

const order =
(affiliateOrders || []).find(
o=>o.id===orderId
)

const payment =
(affiliatePayments || []).find(
p=>p.order_id===orderId
)

const paymentReference =
payment?.provider_payment_id ??
metadata.flowOrder ??
metadata.flow_order ??
metadata.paymentReference ??
metadata.providerPaymentId ??
null

const raffle =
Array.isArray((order as any)?.raffles)
? (order as any).raffles[0]
: (order as any)?.raffles

return{

id:entry.id,

createdAt:entry.created_at,

type:entry.type,

status:entry.status,

credit:
Number(entry.amount_clp)>0
?Number(entry.amount_clp)
:0,

debit:
Number(entry.amount_clp)<0
?Math.abs(Number(entry.amount_clp))
:0,

buyerName:
order?.buyer_name ?? null,

buyerEmail:
order?.buyer_email ?? null,

buyerPhone:
order?.buyer_phone ?? null,

purchaseAmount:
Number(order?.total_clp ?? 0),

quantity:
order?.quantity ?? 0,

raffleTitle:
raffle?.title ?? null,

orderId:
order?.id ?? null,

paymentId:
payment?.id ?? null,

paymentReference

}

})

/* =========================================
   PAYOUT REQUESTS
========================================= */

const { data: payoutRequests } =
await supabase
  .schema("raffles")
  .from("affiliate_payout_requests")
  .select(`
    id,
    amount_clp,
    status,
    processed_by,
    processed_at,
    rejection_reason,
    created_at
  `)
  .eq("affiliate_id", affiliateId)
  .order("created_at", {
    ascending: false
  })

const payouts =
(payoutRequests || []).map((item:any)=>({

  id:item.id,

  createdAt:item.created_at,

  amount:Number(item.amount_clp || 0),

  status:item.status,

  processedBy:item.processed_by,

  processedAt:item.processed_at,

  rejectionReason:item.rejection_reason

}))

  let clicks = 0
let beginCheckout = 0
let totalOrders = 0
let paidOrders = 0
let revenue = 0

/* =========================================
   ANALYTICS
========================================= */

for (const event of events || []) {

  const metadata =
    (event.metadata || {}) as any

  const code =
    String(
      metadata.commercialCode ??
      metadata.affiliateCode ??
      ""
    ).toUpperCase()

  if (code !== affiliateCode) {

    continue

  }

  if (
    event.event_type === "affiliate_click" ||
    event.event_type === "page_view"
  ) {

    clicks++

  }

  if (
    event.event_type === "begin_checkout"
  ) {

    beginCheckout++

  }

}

/* =========================================
   ORDERS
========================================= */

const orders =
  (affiliateOrders || []).filter(order => {

    const tracking =
      ((order.metadata || {}) as any)
        ?.tracking || {}

    return (
      String(
        tracking.commercialCode ?? ""
      ).toUpperCase() === affiliateCode
    )

  })

totalOrders =
  orders.length

const paidOrderIds =
  new Set<string>()

for (const payment of affiliatePayments || []) {

  if (
    payment.status !== "paid" &&
    payment.status !== "approved"
  ) {

    continue

  }

  if (
    !orders.some(
      order =>
        order.id === payment.order_id
    )
  ) {

    continue

  }

  paidOrderIds.add(
    payment.order_id
  )

  revenue += Number(
    payment.amount_clp || 0
  )

}

paidOrders =
  paidOrderIds.size

  const paidCommission =
ledgerEntries.reduce(

  (sum: number, row: any) =>

    sum + row.debit,

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

    /* =========================================
   PAYMENT INDEX
========================================= */

const paymentMap =
  new Map(
    (affiliatePayments || []).map(
      payment => [
        payment.order_id,
        payment
      ]
    )
  )

  const successfulPayments =
  (affiliatePayments || []).filter(
    payment =>
      payment.status === "paid" ||
      payment.status === "approved"
  )

  const sales =
  orders
    .sort((a, b) => {

      return (
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
      );

    })

    .map(order => {

      const payment =
        paymentMap.get(order.id);

        const raffle =
        Array.isArray((order as any).raffles)
        ? (order as any).raffles[0]
        : (order as any).raffles

      return {

        id: order.id,

        buyerName: order.buyer_name,

        buyerEmail: order.buyer_email,

        buyerPhone: order.buyer_phone,

        quantity: order.quantity,

        total: Number(order.total_clp || 0),

        orderStatus: order.status,

        paymentStatus: payment?.status ?? null,

        paymentProvider: payment?.provider ?? null,

        paymentReference:
          payment?.provider_payment_id ?? null,

        paymentAmount:
          Number(payment?.amount_clp || 0),

        paymentCreatedAt:
          payment?.created_at ?? null,

          paymentId:
            payment?.id ?? null,

        createdAt:
  order.created_at,

  raffleTitle:
raffle?.title ?? null,

raffleSlug:
raffle?.slug ?? null,

      };

})

    /* =========================================
   LAST SALE
========================================= */

const lastSale =
  sales.length > 0
    ? sales[0]
    : null

    const wallet =
  await calculateAffiliateWallet(
    affiliate.id
  )

  return {

        affiliate: {

      id:
        affiliate.id,

      name:
        affiliate.owner_email ??
        affiliate.code,

      code:
        affiliate.code,

      email:
        affiliate.owner_email,

      commissionPercent:
        Number(
          affiliate.commission_percent
        ),

      active:
        affiliate.active,

      referralType:
        affiliate.referral_type ??
        "affiliate",

      createdAt:
        affiliate.created_at,

      raffle: null,

    },

    stats: {

      clicks,

      beginCheckout,

      orders: totalOrders,

      paidOrders,

      revenue,

      estimatedCommission,

      generatedCommission:
      wallet.generated,

    pendingCommission:
      wallet.pending,

    paidCommission:
      wallet.paid,

    availableCommission:
      wallet.available

    },

lastSale,

sales,

ledger:

ledgerEntries,

payouts,

generatedAt:
  new Date().toISOString(),

paymentSummary: {

  total:
    affiliatePayments?.length ?? 0,

  successful:
    successfulPayments.length,

  pending:
    (affiliatePayments || []).filter(
      payment =>
        payment.status === "pending"
    ).length,

  failed:
    (affiliatePayments || []).filter(
      payment =>
        payment.status === "failed"
    ).length

}

  }

}