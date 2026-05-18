import { NextResponse } from "next/server"

import { trackEvent } from "@/lib/analytics/trackEvent"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const forwardedFor =
      req.headers.get("x-forwarded-for")

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      null

    const userAgent =
      req.headers.get("user-agent") || null

    await trackEvent({
      event_type: body.event_type,

      campaign_id: body.campaign_id || null,
      payment_id: body.payment_id || null,

      session_id: body.session_id || null,
      user_email: body.user_email || null,

      source: body.source || null,
      referrer: body.referrer || null,

      metadata: body.metadata || {},

      ip,
      user_agent: userAgent
    })

    return NextResponse.json({
      success: true
    })

  } catch (err) {

    console.error("track-event route error:", err)

    return NextResponse.json(
      {
        error: "internal_error"
      },
      {
        status: 500
      }
    )
  }
}