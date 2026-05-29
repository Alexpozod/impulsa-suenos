import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { checkRateLimit }
from "@/lib/raffles/security/checkRateLimit"

import { createAuditLog }
from "@/lib/raffles/admin/createAuditLog"

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

let authorized = false

if (
  token ===
  process.env
    .RAFFLES_INTERNAL_API_KEY
) {
  authorized = true
}

if (
  token &&
  !authorized
) {

  const {
    data: { user }
  } =
    await supabase.auth
      .getUser(token)

  if (user) {

    const {
      data: adminUser
    } =
      await supabase
        .schema("raffles")
        .from("admin_users")
        .select("id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "active",
          true
        )
        .maybeSingle()

    if (adminUser) {
      authorized = true
    }
  }
}

if (!authorized) {

  return NextResponse.json(
    {
      error:
        "unauthorized"
    },
    {
      status: 401
    }
  )
}

    /* =========================
       RATE LIMIT
    ========================= */

    const rateLimit =
      await checkRateLimit({

        key:
          "internal_cleanup",

        route:
          "/api/internal/raffles/cleanup",

        limit: 5,

        windowMinutes: 5

      })

    if (!rateLimit.allowed) {

      return NextResponse.json(
        {
          error:
            "rate_limited"
        },
        {
          status: 429
        }
      )
    }

    const cleanupDate =
      new Date(

        Date.now() -
        7 *
        24 *
        60 *
        60 *
        1000

      ).toISOString()

    /* =========================
       CLEAN RATE LIMITS
    ========================= */

    const {
      error: rateLimitError
    } =
      await supabase
        .schema("raffles")
        .from("rate_limits")
        .delete()
        .lte(
          "created_at",
          cleanupDate
        )

    /* =========================
       CLEAN WEBHOOK EVENTS
    ========================= */

    const {
      error: webhookError
    } =
      await supabase
        .schema("raffles")
        .from("webhook_events")
        .delete()
        .lte(
          "created_at",
          cleanupDate
        )

    /* =========================
       AUDIT LOG
    ========================= */

    await createAuditLog({

      action:
        "cleanup_system",

      entity_type:
        "system",

      metadata: {

        cleanup_date:
          cleanupDate,

        rate_limit_error:
          rateLimitError
            ? true
            : false,

        webhook_error:
          webhookError
            ? true
            : false

      }

    })

    return NextResponse.json({

      ok: true

    })

  } catch (error) {

    console.error(
      "cleanup api error",
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