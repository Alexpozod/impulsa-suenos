import { createClient } from "@supabase/supabase-js"
import { ensureTicketInventory } from "@/lib/raffles/tickets/ensureTicketInventory"
import { recalculateRaffleCounters } from "@/lib/raffles/tickets/recalculateRaffleCounters"
import { createAuditLog } from "@/lib/raffles/admin/createAuditLog"
import { sendComplimentaryTicketsEmail } from "@/lib/raffles/emails/sendComplimentaryTicketsEmail"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AssignComplimentaryTicketsParams {
  raffle_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  quantity: number
  campaign_name?: string
  reason?: string
  admin_user_id: string
}

export async function assignComplimentaryTickets({
  raffle_id, buyer_name, buyer_email, buyer_phone,
  quantity, campaign_name, reason, admin_user_id
}: AssignComplimentaryTicketsParams) {
  const normalizedEmail = buyer_email.trim().toLowerCase()
  const normalizedName = buyer_name.trim()
  const normalizedPhone = buyer_phone?.trim() || null
  const normalizedCampaignName = campaign_name?.trim() || null
  const normalizedReason = reason?.trim() || null

  if (!raffle_id) throw new Error("raffle_id_required")
  if (!normalizedName) throw new Error("buyer_name_required")
  if (!normalizedEmail) throw new Error("buyer_email_required")
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new Error("invalid_quantity")
  }

  const { data: raffle, error: raffleError } = await supabase.schema("raffles")
    .from("raffles").select("id,title,slug,status")
    .eq("id", raffle_id).maybeSingle()

  if (raffleError || !raffle) throw new Error("raffle_not_found")
  if (raffle.status === "cancelled" || raffle.status === "completed") {
    throw new Error("raffle_not_assignable")
  }

  await ensureTicketInventory(raffle_id)

  // PostgreSQL creates the paid zero-value order, claims exactly N distinct
  // available tickets and writes their ownership in a single transaction.
  const { data, error } = await supabase.schema("raffles")
    .rpc("assign_complimentary_tickets_atomic", {
      p_raffle_id: raffle_id,
      p_buyer_name: normalizedName,
      p_buyer_email: normalizedEmail,
      p_buyer_phone: normalizedPhone,
      p_quantity: quantity,
      p_campaign_name: normalizedCampaignName,
      p_reason: normalizedReason,
      p_admin_user_id: admin_user_id
    })

  if (error) {
    console.error("raffles_complimentary_atomic_assignment_failed", error.code)
    throw new Error("complimentary_ticket_assignment_failed")
  }

  const order = data?.order
  const assignedTickets = data?.tickets
  if (!order?.id || !Array.isArray(assignedTickets) ||
      assignedTickets.length !== quantity) {
    // Never attempt a compensating delete: the DB transaction is authoritative.
    throw new Error("complimentary_assignment_response_invalid")
  }

  // Post-commit side effects must not make a successful assignment look failed
  // and cause an administrator to issue a second grant.
  try {
    await recalculateRaffleCounters({ raffle_id })
  } catch {
    console.error("raffles_complimentary_counter_recalculation_failed")
  }

  try {
    await createAuditLog({
      admin_user_id,
      action: "complimentary_tickets_assigned",
      entity_type: "order",
      entity_id: order.id,
      metadata: {
        raffle_id, raffle_title: raffle.title, raffle_slug: raffle.slug,
        buyer_name: normalizedName, buyer_email: normalizedEmail,
        buyer_phone: normalizedPhone, quantity,
        campaign_name: normalizedCampaignName, reason: normalizedReason,
        ticket_ids: assignedTickets.map(ticket => ticket.id),
        ticket_codes: assignedTickets.map(ticket => ticket.ticket_code)
      }
    })
  } catch {
    console.error("raffles_complimentary_audit_event_failed")
  }

  let emailSent = false
  try {
    await sendComplimentaryTicketsEmail({
      email: normalizedEmail,
      buyerName: normalizedName,
      raffleTitle: raffle.title || "Sorteo",
      tickets: assignedTickets,
      campaignName: normalizedCampaignName,
      reason: normalizedReason
    })
    emailSent = true
  } catch {
    console.error("raffles_complimentary_email_failed")
  }

  return { raffle, order, tickets: assignedTickets, email_sent: emailSent }
}
