import { NextResponse }
from "next/server"

import { releaseExpiredReservations }
from "@/lib/raffles/tickets/releaseExpiredReservations"

import { createAuditLog }
from "@/lib/raffles/admin/createAuditLog"

import { checkRateLimit }
from "@/lib/raffles/security/checkRateLimit"

export const runtime = "nodejs"

export async function GET(
  req: Request
) {

  try {

    /* =========================
       INTERNAL AUTH
    ========================= */

    const authHeader =
      req.headers.get(
        "authorization"
      )

    if (
      authHeader !==
      `Bearer ${process.env.RAFFLES_INTERNAL_API_KEY}`
    ) {

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
   RATE LIMIT
========================= */

const rateLimit =
  await checkRateLimit({

    key:
      "internal_release_reservations",

    route:
      "/api/internal/raffles/release-reservations",

    limit: 10,

    windowMinutes: 1

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

    /* =========================
       RELEASE EXPIRED
    ========================= */

    const result =
      await releaseExpiredReservations()

await createAuditLog({

  action:
    "release_reservations",

  entity_type:
    "ticket_inventory",

  metadata: {

  released:
    result.released || 0

}

})

    return NextResponse.json({

      ok: true,

      released:
        result.released || 0

    })

  } catch (error) {

    console.error(
      "internal release reservations error",
      error
    )

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