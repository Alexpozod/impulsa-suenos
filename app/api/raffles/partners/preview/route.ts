import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {

  try {

    const user =
  await requireUser(req)

const email =
  user.email?.toLowerCase()

const {
  data: affiliate
} =
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
      error: "affiliate_not_found"
    },
    {
      status: 403
    }
  )

}

const {
  data: partner
} =
  await supabase
    .schema("raffles")
    .from("partner_profiles")
    .select("id")
    .eq(
      "affiliate_id",
      affiliate.id
    )
    .maybeSingle()

if (!partner) {

  return NextResponse.json(
    {
      error: "partner_not_found"
    },
    {
      status: 403
    }
  )

}

    const path =
      req.nextUrl.searchParams.get("path")

    if (!path) {

      return NextResponse.json(
        { error: "missing_path" },
        { status: 400 }
      )

    }

    const {

      data,

      error

    } =
      await supabase
        .storage
        .from("partner-resources")
        .createSignedUrl(
          path,
          60 * 10
        )

    if (error || !data?.signedUrl) {

      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      )

    }

    return NextResponse.json({

  url:
    data.signedUrl

})

  }

  catch (error) {

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