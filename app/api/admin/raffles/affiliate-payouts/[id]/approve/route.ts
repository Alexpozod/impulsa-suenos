import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

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

    const { id } = await context.params
    const { data, error } = await supabase.schema("raffles").rpc("decide_affiliate_payout", {
      p_request_id: id,
      p_decision: "approve",
      p_auth_user_id: user.id,
      p_admin_id: admin.id
    })

    if (error) throw error
    const result: unknown = data
    if (!result || typeof result !== "object" || Array.isArray(result) || !("outcome" in result)) {
      throw new Error("invalid_payout_decision_response")
    }

    switch (result.outcome) {
      case "applied":
        return NextResponse.json({ success: true })
      case "replayed":
        return NextResponse.json({ success: true, message: "already_processed" })
      case "decision_conflict":
      case "insufficient_balance":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 409 })
      case "request_not_found":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 404 })
      case "invalid_request":
      case "invalid_decision":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 400 })
      case "unauthorized":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 401 })
      case "forbidden":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 403 })
      case "payout_inconsistent":
      case "ledger_inconsistent":
      case "payout_amount_not_representable":
        return NextResponse.json({ success: false, error: result.outcome }, { status: 500 })
      default:
        throw new Error("unexpected_payout_decision_outcome")
    }
  } catch {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 })
  }
}
