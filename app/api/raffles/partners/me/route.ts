import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"

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

    const { data: affiliate, error } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("*")
        .eq(
          "owner_email",
          email
        )
        .maybeSingle()

    if (error) {

      console.error(
        "PARTNER LOOKUP ERROR",
        error
      )

      return NextResponse.json(
        {
          error: "partner_lookup_failed"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      user: {
        id: user.id,
        email
      },

      affiliate:
        affiliate || null

    })

  } catch (error: any) {

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