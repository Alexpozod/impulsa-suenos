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

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("id")
        .eq("owner_email", email)
        .maybeSingle()

    if (!affiliate) {

      return NextResponse.json({
        ok: false,
        error: "affiliate_not_found"
      })

    }

    const { data: profile } =
      await supabase
        .schema("raffles")
        .from("partner_profiles")
        .select("*")
        .eq(
          "affiliate_id",
          affiliate.id
        )
        .maybeSingle()

    return NextResponse.json({
      ok: true,
      profile
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
        status: 401
      }
    )

  }

}

export async function POST(req: Request) {

  try {

    const user =
      await requireUser(req)

    const body =
      await req.json()

    const email =
      user.email?.toLowerCase()

    const { data: affiliate } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .select("id")
        .eq("owner_email", email)
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

    const payload = {

      affiliate_id:
        affiliate.id,

      first_name:
        body.first_name,

      last_name:
        body.last_name,

      phone:
        body.phone,

      rut:
        body.rut,

      bank_name:
        body.bank_name,

      account_type:
        body.account_type,

      account_number:
        body.account_number,

      account_holder:
        body.account_holder,

      updated_at:
        new Date()
          .toISOString()

    }

    const { error } =
      await supabase
        .schema("raffles")
        .from("partner_profiles")
        .upsert(
          payload,
          {
            onConflict:
              "affiliate_id"
          }
        )

    if (error) {

      throw error

    }

    return NextResponse.json({
      ok: true
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