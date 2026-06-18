import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"
import { getAffiliateDashboard } from "@/lib/raffles/affiliate/getAffiliateDashboard"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {

  try {

    const user =
      await requireUser(req)

    const email =
      user.email?.toLowerCase()

    if (!email) {

      return NextResponse.json(
        {
          error: "email_not_found"
        },
        {
          status: 400
        }
      )
    }

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("*")
        .eq(
          "owner_email",
          email
        )
        .maybeSingle()

    if (!affiliate) {

      return NextResponse.json({

        ok: true,

        affiliate: null,

        stats: null

      })
    }

    const dashboard =
      await getAffiliateDashboard(
        affiliate.id
      )

    return NextResponse.json({

      ok: true,

      ...dashboard

    })

  } catch (error: any) {

    console.error(
      "PARTNER DASHBOARD ERROR",
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          "server_error"
      },
      {
        status: 401
      }
    )
  }
}