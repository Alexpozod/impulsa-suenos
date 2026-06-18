import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const user =
      await requireUser(req)

    const email =
      user.email?.toLowerCase()

    const { otp } =
      await req.json()

    if (!otp) {

      return NextResponse.json(
        {
          ok: false,
          error: "otp_required"
        },
        {
          status: 400
        }
      )

    }

    const { data: code } =
      await supabase
        .from("otp_codes")
        .select("*")
        .eq("user_email", email)
        .eq("code", otp)
        .eq("verified", true)
        .eq("used", false)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(1)
        .maybeSingle()

    if (!code) {

      return NextResponse.json(
        {
          ok: false,
          error: "invalid_otp"
        },
        {
          status: 400
        }
      )

    }

    await supabase
      .from("otp_codes")
      .update({
        used: true
      })
      .eq("id", code.id)

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("id")
        .eq(
          "owner_email",
          email
        )
        .maybeSingle()

    if (!affiliate) {

      return NextResponse.json(
        {
          ok: false,
          error:
            "affiliate_not_found"
        },
        {
          status: 404
        }
      )

    }

    const unlockUntil =
      new Date(
        Date.now() +
        15 * 60 * 1000
      ).toISOString()

    await supabase
      .schema("raffles")
      .from("partner_profiles")
      .update({

        profile_locked:
          false,

        edit_window_until:
          unlockUntil,

        profile_verified_at:
          new Date()
            .toISOString()

      })
      .eq(
        "affiliate_id",
        affiliate.id
      )

    return NextResponse.json({

      ok: true,

      unlockUntil

    })

  } catch (error: any) {

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "server_error"
      },
      {
        status: 500
      }
    )

  }

}