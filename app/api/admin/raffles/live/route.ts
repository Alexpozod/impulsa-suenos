import { NextResponse }
from "next/server"

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

export async function GET(
  req: Request
) {

  try {

    /* =========================
       AUTH
    ========================= */

    const authHeader =
      req.headers.get(
        "authorization"
      )

    const token =
      authHeader?.replace(
        "Bearer ",
        ""
      )

    if (!token) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    const {
      data: { user }
    } =
      await supabase.auth
        .getUser(token)

    if (!user) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    /* =========================
       LOAD EVENTS
    ========================= */

    const {
      data: events,
      error
    } =
      await supabase
        .schema("raffles")
        .from("analytics_events")
        .select(`
          *,
          raffles (
            title,
            slug
          )
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(100)

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error: "live_events_error"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       FORMAT EVENTS
    ========================= */

    const formatted =
      (events || []).map(event => ({

        id:
          event.id,

        event_type:
          event.event_type,

        source:
          event.source || "direct",

        utm_campaign:
          event.utm_campaign || null,

        raffle:
          event.raffles || null,

        raffle_id:
          event.raffle_id,

        ip_address:
          event.ip_address || null,

        user_agent:
          event.user_agent || null,

        metadata:
          event.metadata || {},

        created_at:
          event.created_at

      }))

    return NextResponse.json({

      ok: true,

      events:
        formatted

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )
  }
}