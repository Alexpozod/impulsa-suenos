import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {

  try {

    const token =
      req.headers
        .get("authorization")
        ?.replace("Bearer ", "")

    if (!token) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )

    }

    const {

      data: { user },

      error: authError

    } =
      await supabase.auth.getUser(token)

    if (authError || !user) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )

    }

    const {

      data: partner

    } =
      await supabase
        .schema("raffles")
        .from("partner_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

    if (!partner) {

      return NextResponse.json(
        { error: "forbidden" },
        { status: 403 }
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
        .from("raffles-partner-resources")
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