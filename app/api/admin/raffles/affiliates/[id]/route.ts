import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

import { getAffiliateDashboard }
from "@/lib/raffles/affiliate/getAffiliateDashboard"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(

  req: Request,

  context: {

    params: Promise<{

      id: string

    }>

  }

) {

  try {
    const token = req.headers.get("authorization")?.match(/^Bearer +([^\s]+)$/i)?.[1]
    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    try {
      await requireRaffleAdmin({ user_id: user.id })
    } catch (error) {
      if (error instanceof Error &&
          (error.message === "raffle_admin_required" || error.message === "raffle_admin_forbidden")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 })
      }
      throw error
    }

    const {

      id

    } = await context.params

    const dashboard =
      await getAffiliateDashboard(
        id
      )

    return NextResponse.json(
      dashboard
    )

  }

  catch (error) {

    console.error(

      "affiliate dashboard error",

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