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

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("partner_resources")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order")

    if (error) throw error

    return NextResponse.json({

      ok: true,

      resources:
        data || []

    })

  } catch (error) {

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