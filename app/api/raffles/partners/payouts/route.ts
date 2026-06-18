import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"
import { calculateAffiliateWallet } from "@/lib/raffles/affiliate/calculateAffiliateWallet"
import { createAffiliatePayoutRequest } from "@/lib/raffles/affiliate/createAffiliatePayoutRequest"
import { canRequestAffiliatePayout } from "@/lib/raffles/affiliate/canRequestAffiliatePayout"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAffiliate(email: string) {
  const { data } = await supabase
    .schema("raffles")
    .from("raffle_referrals")
    .select("*")
    .eq("owner_email", email)
    .maybeSingle()

  return data
}

export async function GET(req: Request) {
  try {
    const user = await requireUser(req)

    const affiliate =
      await getAffiliate(
        user.email!.toLowerCase()
      )

    if (!affiliate) {
      return NextResponse.json(
        {
          ok: false,
          error: "affiliate_not_found"
        },
        {
          status: 404
        }
      )
    }

    const wallet =
      await calculateAffiliateWallet(
        affiliate.id
      )

    const { data: requests } =
      await supabase
        .schema("raffles")
        .from("affiliate_payout_requests")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", {
          ascending: false
        })

    return NextResponse.json({
      ok: true,
      wallet,
      requests: requests || []
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

export async function POST(req: Request) {
  try {
    const user = await requireUser(req)

    const affiliate =
      await getAffiliate(
        user.email!.toLowerCase()
      )

    if (!affiliate) {
      return NextResponse.json(
        {
          ok: false,
          error: "affiliate_not_found"
        },
        {
          status: 404
        }
      )
    }

    const validation =
      await canRequestAffiliatePayout(
        affiliate.id
      )

    if (!validation.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.reason
        },
        {
          status: 400
        }
      )
    }

    const request =
      await createAffiliatePayoutRequest({
        affiliateId: affiliate.id,
        amount:
          validation.wallet.available
      })

    return NextResponse.json({
      ok: true,
      request
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