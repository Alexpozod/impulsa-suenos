import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"
import { reserveAffiliatePayout } from "@/lib/raffles/affiliate/createAffiliatePayoutRequest"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = req.headers.get("authorization")?.match(/^Bearer +([^\s]+)$/i)?.[1]
    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    let admin: Awaited<ReturnType<typeof requireRaffleAdmin>>
    try {
      admin = await requireRaffleAdmin({ user_id: user.id })
    } catch (error) {
      if (error instanceof Error &&
          (error.message === "raffle_admin_required" || error.message === "raffle_admin_forbidden")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 })
      }

      throw error
    }

    const idempotencyKey = req.headers.get("Idempotency-Key")
    if (!idempotencyKey || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return NextResponse.json({ success: false, error: "invalid_idempotency_key" }, { status: 400 })
    }

    const { id } = await context.params
    const result = await reserveAffiliatePayout({
      channel: "admin",
      affiliateId: id,
      authUserId: user.id,
      adminId: admin.id,
      idempotencyKey
    })

    switch (result.outcome) {
      case "created":
      case "replayed": {
        const { id, affiliate_id, amount_clp, status, processed_by, processed_at, rejection_reason, created_at } =
          result.request
        return NextResponse.json({
          success: true,
          request: { id, affiliate_id, amount_clp, status, processed_by, processed_at, rejection_reason, created_at }
        })
      }
      case "pending_request_exists":
        return NextResponse.json({ success: false, error: result.outcome, requestId: result.requestId })
      case "no_available_balance":
        return NextResponse.json({ success: false, error: result.outcome })
      case "unauthorized":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 401 })
      case "forbidden":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 403 })
      case "invalid_request":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 400 })
      case "affiliate_not_found":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 404 })
      case "payout_inconsistent":
      case "payout_amount_not_representable":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 409 })
      case "minimum_not_reached":
      case "otp_required":
      case "invalid_otp":
        throw new Error("unexpected_admin_payout_outcome")
      default: {
        const unexpected: never = result
        throw new Error("unexpected_payout_outcome", { cause: unexpected })
      }
    }
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 })
  }
}
