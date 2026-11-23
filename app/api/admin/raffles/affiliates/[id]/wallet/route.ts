import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

import { calculateAffiliateWallet }
from "@/lib/raffles/affiliate/calculateAffiliateWallet"

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

){

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

    const { id } =
      await context.params

    const wallet =
      await calculateAffiliateWallet(
        id
      )

    return NextResponse.json({

      wallet

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        wallet:{

          generated:0,

          available:0,

          paid:0,

          pending:0

        }

      },

      {

        status:500

      }

    )

  }

}