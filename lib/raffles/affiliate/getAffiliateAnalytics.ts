import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getAffiliateAnalytics(

  affiliateCode: string

){

  const {

    data: events

  } =
  await supabase
    .schema("raffles")
    .from("analytics_events")
    .select(`
      event_type,
      metadata
    `)

  let clicks = 0

  let beginCheckout = 0

  for(const event of events || []){

    const metadata =
      (event.metadata || {}) as any

    const code =
      String(

        metadata.commercialCode ??

        metadata.affiliateCode ??

        ""

      ).toUpperCase()

    if(
      code !==
      affiliateCode
    ){

      continue

    }

    if(

      event.event_type ===
      "affiliate_click" ||

      event.event_type ===
      "page_view"

    ){

      clicks++

    }

    if(

      event.event_type ===
      "begin_checkout"

    ){

      beginCheckout++

    }

  }

  return{

    clicks,

    beginCheckout

  }

}