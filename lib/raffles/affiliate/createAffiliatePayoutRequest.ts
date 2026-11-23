import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ReserveAffiliatePayoutInput = {
  affiliateId: string
  idempotencyKey: string
  authUserId: string
} & (
  | { channel: "portal"; email: string; otp: string | null }
  | { channel: "admin"; adminId: string }
)

type PayoutRequest = {
  id: string
  affiliate_id: string
  amount_clp: number
  status: string
  metadata: unknown
  processed_by: string | null
  processed_at: string | null
  rejection_reason: string | null
  created_at: string
}

type ReserveAffiliatePayoutResult =
  | { outcome: "created" | "replayed"; request: PayoutRequest }
  | { outcome: "pending_request_exists"; requestId: string }
  | {
      outcome:
        | "unauthorized"
        | "invalid_request"
        | "forbidden"
        | "affiliate_not_found"
        | "otp_required"
        | "invalid_otp"
        | "payout_inconsistent"
        | "minimum_not_reached"
        | "no_available_balance"
        | "payout_amount_not_representable"
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPayoutRequest(value: unknown): value is PayoutRequest {
  return isRecord(value)
    && typeof value.id === "string" && value.id.length > 0
    && typeof value.affiliate_id === "string"
    && typeof value.amount_clp === "number" && Number.isSafeInteger(value.amount_clp)
    && typeof value.status === "string"
    && Object.hasOwn(value, "metadata")
    && (value.processed_by === null || typeof value.processed_by === "string")
    && (value.processed_at === null || typeof value.processed_at === "string")
    && (value.rejection_reason === null || typeof value.rejection_reason === "string")
    && typeof value.created_at === "string"
}

export function projectAffiliatePayoutRequest<T extends { metadata: unknown }>(
  request: T
): Omit<T, "metadata"> & { metadata: unknown } {
  if (!isRecord(request.metadata)) return request

  const metadata = { ...request.metadata }
  delete metadata.idempotencyKey
  delete metadata.idempotencyChannel

  return { ...request, metadata }
}

export async function reserveAffiliatePayout(
  input: ReserveAffiliatePayoutInput
): Promise<ReserveAffiliatePayoutResult> {
  const { data, error } = await supabase.schema("raffles").rpc("reserve_affiliate_payout", {
    p_affiliate_id: input.affiliateId,
    p_channel: input.channel,
    p_idempotency_key: input.idempotencyKey,
    p_auth_user_id: input.authUserId,
    p_admin_id: input.channel === "admin" ? input.adminId : null,
    p_portal_email: input.channel === "portal" ? input.email : null,
    p_otp: input.channel === "portal" ? input.otp : null
  })

  if (error) throw new Error("affiliate_payout_rpc_failed")

  const result: unknown = data
  if (!isRecord(result)) throw new Error("affiliate_payout_invalid_response")

  const { outcome } = result

  switch (outcome) {
    case "created":
    case "replayed":
      if (isPayoutRequest(result.request) &&
          result.request.affiliate_id.toLowerCase() === input.affiliateId.toLowerCase()) {
        return { outcome, request: projectAffiliatePayoutRequest(result.request) }
      }
      break
    case "pending_request_exists":
      if (typeof result.requestId === "string" && result.requestId.length > 0) {
        return { outcome, requestId: result.requestId }
      }
      break
    case "unauthorized":
    case "invalid_request":
    case "forbidden":
    case "affiliate_not_found":
    case "otp_required":
    case "invalid_otp":
    case "payout_inconsistent":
    case "minimum_not_reached":
    case "no_available_balance":
    case "payout_amount_not_representable":
      return { outcome }
  }

  throw new Error("affiliate_payout_invalid_response")
}
