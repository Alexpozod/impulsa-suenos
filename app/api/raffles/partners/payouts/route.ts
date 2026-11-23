import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireUser } from "@/lib/auth/requireUser"
import { calculateAffiliateWallet } from "@/lib/raffles/affiliate/calculateAffiliateWallet"
import { reserveAffiliatePayout } from "@/lib/raffles/affiliate/createAffiliatePayoutRequest"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAffiliate(email: string) {
  const { data, error } = await supabase
    .schema("raffles")
    .from("raffle_referrals")
    .select("id")
    .eq("owner_email", email)
    .maybeSingle()

  if (error) throw error
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
        .select("id, affiliate_id, amount_clp, status, processed_by, processed_at, rejection_reason, created_at")
        .eq("affiliate_id", affiliate.id)
        .order("created_at", {
          ascending: false
        })

    return NextResponse.json({
      ok: true,
      wallet,
      requests: requests ?? []
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "server_error"
      },
      {
        status: 500
      }
    )
  }
}

export async function POST(req: Request) {
  // Retain the portal's existing response for a rejected session.
  let user: Awaited<ReturnType<typeof requireUser>>
  try {
    user = await requireUser(req)
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    return NextResponse.json(
      { ok: false, error: ["unauthorized", "invalid user"].includes(message) ? message : "server_error" },
      { status: 500 }
    )
  }

  const idempotencyKey = req.headers.get("Idempotency-Key")
  if (!idempotencyKey ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return NextResponse.json({ ok: false, error: "invalid_idempotency_key" }, { status: 400 })
  }

  let otp: string | null = null
  try {
    const payload = await req.text()
    if (payload.trim()) {
      const body: unknown = JSON.parse(payload)
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 })
      }
      if ("otp" in body && body.otp != null) {
        if (typeof body.otp !== "string") {
          return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 })
        }
        otp = body.otp.trim() || null
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 })
  }

  try {
    const email = user.email?.toLowerCase()
    const affiliate = email ? await getAffiliate(email) : null
    if (!email || !affiliate) {
      return NextResponse.json({ ok: false, error: "affiliate_not_found" }, { status: 404 })
    }

    const result = await reserveAffiliatePayout({
      channel: "portal",
      affiliateId: affiliate.id,
      authUserId: user.id,
      idempotencyKey,
      email,
      otp
    })

    switch (result.outcome) {
      case "created":
      case "replayed": {
        const { id, affiliate_id, amount_clp, status, processed_by, processed_at, rejection_reason, created_at } =
          result.request
        return NextResponse.json({
          ok: true,
          request: { id, affiliate_id, amount_clp, status, processed_by, processed_at, rejection_reason, created_at }
        })
      }
      case "otp_required":
      case "invalid_otp":
        return NextResponse.json({ ok: false, error: "invalid_otp" }, { status: 400 })
      case "pending_request_exists":
        return NextResponse.json(
          { ok: false, error: result.outcome, requestId: result.requestId },
          { status: 400 }
        )
      case "no_available_balance":
      case "minimum_not_reached":
        return NextResponse.json({ ok: false, error: "minimum_not_reached" }, { status: 400 })
      case "invalid_request":
        return NextResponse.json({ ok: false, error: result.outcome }, { status: 400 })
      case "affiliate_not_found":
        return NextResponse.json({ ok: false, error: result.outcome }, { status: 404 })
      case "payout_inconsistent":
      case "payout_amount_not_representable":
        return NextResponse.json({ ok: false, error: result.outcome }, { status: 409 })
      default:
        return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
    }
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}
