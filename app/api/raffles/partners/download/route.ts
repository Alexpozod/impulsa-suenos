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

    await requireUser(req)

    const { searchParams } =
      new URL(req.url)

    const path =
      searchParams.get("path")

    if (!path) {

      return NextResponse.json(
        {
          error: "path_required"
        },
        {
          status: 400
        }
      )

    }

    const { data, error } =
      await supabase.storage
        .from("partner-resources")
        .createSignedUrl(
          path,
          60 * 5
        )

    if (error) {

      throw error

    }

    return NextResponse.json({

      ok: true,

      url: data.signedUrl

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(
      {
        error:"server_error"
      },
      {
        status:500
      }
    )

  }

}