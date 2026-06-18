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
        raffles: []
      })

    }

    const { data: raffles } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select(`
          id,
          slug,
          title,
          status
        `)
        .eq(
          "status",
          "active"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    return NextResponse.json({

      ok: true,

      affiliate: {

        code:
          affiliate.code

      },

      raffles:
        raffles || []

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