import { NextResponse }
from "next/server"

import { trackEvent }
from "@/lib/raffles/analytics/trackEvent"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!

  )

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    let raffle_id =
      body.raffle_id || null

    /* =========================
       RESOLVE SLUG
    ========================= */

    if (
      !raffle_id &&
      body.raffle_slug
    ) {

      const {
        data: raffle
      } =
        await supabase
          .schema("raffles")
          .from("raffles")
          .select("id")
          .eq(
            "slug",
            body.raffle_slug
          )
          .maybeSingle()

      raffle_id =
        raffle?.id || null

    }

    const forwardedFor =
      req.headers.get(
        "x-forwarded-for"
      )

    const ip =
      forwardedFor
        ?.split(",")[0]
        ?.trim() || null

    const userAgent =
      req.headers.get(
        "user-agent"
      ) || null

    await trackEvent({

      event_type:
        body.event_type,

      raffle_id,

      source:
        body.source || null,

      referrer:
        body.referrer || null,

      ip,

      user_agent:
        userAgent,

      metadata:
        body.metadata || {}

    })

    return NextResponse.json({

      ok: true

    })

  } catch (error) {

    console.error(
      "raffles track event error",
      error
    )

    return NextResponse.json(
      {
        error:
          "server_error"
      },
      {
        status: 500
      }
    )
  }
}