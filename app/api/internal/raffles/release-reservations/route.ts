import { NextResponse }
from "next/server"

import { releaseExpiredReservations }
from "@/lib/raffles/tickets/releaseExpiredReservations"

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
      `Bearer ${process.env.INTERNAL_API_SECRET}`
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
       RELEASE EXPIRED
    ========================= */

    const result =
      await releaseExpiredReservations()

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