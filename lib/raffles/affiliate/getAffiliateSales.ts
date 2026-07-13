import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAGE_SIZE = 25;

export async function getAffiliateSales(
  affiliateId: string,
  page = 1
) {
  const offset = (page - 1) * PAGE_SIZE;

  /* =========================================
     AFFILIATE
  ========================================= */

  const { data: affiliate } = await supabase
    .schema("raffles")
    .from("raffle_referrals")
    .select("code, commission_percent")
    .eq("id", affiliateId)
    .maybeSingle();

  if (!affiliate) {
    return {
      page,
      pageSize: PAGE_SIZE,
      total: 0,
      totalPages: 0,
      rows: [],
    };
  }

  const affiliateCode = String(
    affiliate.code ?? ""
  ).toUpperCase();

  /* =========================================
     ORDERS
  ========================================= */

  const { data: orders } = await supabase
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

  const { data: payments } = await supabase
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
    `);

    /* =========================================
   LEDGER
========================================= */

const { data: ledger } =
  await supabase
    .schema("raffles")
    .from("ledger")
    .select(`
      amount_clp,
      metadata
    `)
    .eq(
      "type",
      "affiliate_commission"
    )

const commissionMap =
  new Map(

    (ledger || [])

      .filter((entry: any) => {

        const metadata =
          entry.metadata || {}

        return (
          metadata.affiliateId ===
          affiliateId
        )

      })

      .map((entry: any) => {

        const metadata =
          entry.metadata || {}

        return [

          metadata.orderId,

          metadata.commissionAmount ??

          Math.abs(
            Number(entry.amount_clp)
          )

        ]

      })

  )

  const filteredOrders =
    (orders || []).filter(order => {

      const tracking =
        ((order.metadata || {}) as any)
          ?.tracking || {};

      return (
        String(
          tracking.commercialCode ?? ""
        ).toUpperCase() === affiliateCode
      );

    });

  const total = filteredOrders.length;

  const paymentMap = new Map(
    (payments || []).map(payment => [
      payment.order_id,
      payment,
    ])
  );

  const rows = filteredOrders
    .sort((a, b) => {

      return (
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
      );

    })
    .slice(offset, offset + PAGE_SIZE)
    .map(order => {

      const payment =
        paymentMap.get(order.id);

      const raffle =
        Array.isArray((order as any).raffles)
          ? (order as any).raffles[0]
          : (order as any).raffles;

      return {

        id: order.id,

        buyerName: order.buyer_name,

        buyerEmail: order.buyer_email,

        buyerPhone: order.buyer_phone,

        quantity: order.quantity,

        total: Number(order.total_clp ?? 0),

        orderStatus: order.status,

        paymentStatus: payment?.status ?? null,

        paymentProvider: payment?.provider ?? null,

        paymentReference:
          payment?.provider_payment_id ?? null,

        paymentAmount:
          Number(payment?.amount_clp ?? 0),

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

        commission:
  commissionMap.get(order.id) ?? 0,

      };

    });

  return {

    page,

    pageSize: PAGE_SIZE,

    total,

    totalPages:
      Math.ceil(total / PAGE_SIZE),

    rows,

  };

}