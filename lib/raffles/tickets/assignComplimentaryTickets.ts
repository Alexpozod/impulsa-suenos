import { createClient }
from "@supabase/supabase-js"

import { ensureTicketInventory }
from "@/lib/raffles/tickets/ensureTicketInventory"

import { selectAvailableTickets }
from "@/lib/raffles/tickets/allocator/selectAvailableTickets"

import { recalculateRaffleCounters }
from "@/lib/raffles/tickets/recalculateRaffleCounters"

import { createAuditLog }
from "@/lib/raffles/admin/createAuditLog"

import {
  sendComplimentaryTicketsEmail
} from "@/lib/raffles/emails/sendComplimentaryTicketsEmail"

const supabase =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
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

export async function
assignComplimentaryTickets({

  raffle_id,

  buyer_name,

  buyer_email,

  buyer_phone,

  quantity,

  campaign_name,

  reason,

  admin_user_id

}: AssignComplimentaryTicketsParams) {

  const normalizedEmail =
    buyer_email
      .trim()
      .toLowerCase()

  const normalizedName =
    buyer_name
      .trim()

  const normalizedPhone =
    buyer_phone
      ?.trim() || null

  const normalizedCampaignName =
    campaign_name
      ?.trim() || null

  const normalizedReason =
    reason
      ?.trim() || null

  if (!raffle_id) {

    throw new Error(
      "raffle_id_required"
    )
  }

  if (!normalizedName) {

    throw new Error(
      "buyer_name_required"
    )
  }

  if (!normalizedEmail) {

    throw new Error(
      "buyer_email_required"
    )
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {

    throw new Error(
      "invalid_quantity"
    )
  }

  /* =========================================
     LOAD RAFFLE
  ========================================= */

  const {
    data: raffle,
    error: raffleError
  } =
    await supabase
      .schema("raffles")
      .from("raffles")
      .select(`
        id,
        title,
        slug,
        status
      `)
      .eq(
        "id",
        raffle_id
      )
      .maybeSingle()

  if (
    raffleError ||
    !raffle
  ) {

    throw new Error(
      "raffle_not_found"
    )
  }

  if (
    raffle.status === "cancelled" ||
    raffle.status === "completed"
  ) {

    throw new Error(
      "raffle_not_assignable"
    )
  }

  /* =========================================
     ENSURE INVENTORY
  ========================================= */

  await ensureTicketInventory(
    raffle_id
  )

  /* =========================================
     SELECT AVAILABLE TICKETS
  ========================================= */

  const selectedTickets =
    await selectAvailableTickets(
      raffle_id,
      quantity
    )

  if (
    selectedTickets.length <
    quantity
  ) {

    throw new Error(
      "not_enough_tickets_available"
    )
  }

  /* =========================================
     CREATE ZERO-VALUE ORDER
  ========================================= */

  const assignmentTimestamp =
    new Date()
      .toISOString()

  const orderMetadata = {

    order_type:
      "complimentary",

    assignment_type:
      "complimentary",

    assignment_source:
      "admin",

    campaign_name:
      normalizedCampaignName,

    reason:
      normalizedReason,

    assigned_by_admin_user_id:
      admin_user_id,

    assigned_at:
      assignmentTimestamp

  }

  const {
    data: order,
    error: orderError
  } =
    await supabase
      .schema("raffles")
      .from("orders")
      .insert({

        raffle_id,

        buyer_name:
          normalizedName,

        buyer_email:
          normalizedEmail,

        buyer_phone:
          normalizedPhone,

        quantity,

        subtotal_clp: 0,

        total_clp: 0,

        currency: "CLP",

        status: "paid",

        source:
          "admin_complimentary",

        metadata:
          orderMetadata

      })
      .select(`
        id,
        raffle_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        quantity,
        status,
        source,
        metadata,
        created_at
      `)
      .single()

  if (
    orderError ||
    !order
  ) {

    console.error(
      "complimentary order error",
      orderError
    )

    throw new Error(
      "complimentary_order_creation_failed"
    )
  }

  const selectedTicketIds =
    selectedTickets.map(
      ticket => ticket.id
    )

  try {

    /* =========================================
       ASSIGN REAL INVENTORY
    ========================================= */

    const ticketMetadata = {

      assignment_type:
        "complimentary",

      assignment_source:
        "admin",

      campaign_name:
        normalizedCampaignName,

      reason:
        normalizedReason,

      assigned_by_admin_user_id:
        admin_user_id,

      assigned_at:
        assignmentTimestamp

    }

    const {
      data: assignedTickets,
      error: assignmentError
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .update({

          status:
            "complimentary",

          order_id:
            order.id,

          payment_id:
            null,

          buyer_email:
            normalizedEmail,

          reserved_until:
            null,

          reservation_token:
            null,

          metadata:
            ticketMetadata,

          updated_at:
            assignmentTimestamp

        })
        .in(
          "id",
          selectedTicketIds
        )
        .eq(
          "raffle_id",
          raffle_id
        )
        .eq(
          "status",
          "available"
        )
        .select(`
          id,
          raffle_id,
          ticket_code,
          ticket_number,
          status,
          order_id,
          payment_id,
          buyer_email,
          metadata
        `)

    if (assignmentError) {

      throw assignmentError
    }

    if (
      !assignedTickets ||
      assignedTickets.length !==
      quantity
    ) {

      if (
        assignedTickets &&
        assignedTickets.length > 0
      ) {

        await supabase
          .schema("raffles")
          .from("ticket_inventory")
          .update({

            status:
              "available",

            order_id:
              null,

            payment_id:
              null,

            buyer_email:
              null,

            reserved_until:
              null,

            reservation_token:
              null,

            metadata: {},

            updated_at:
              new Date()
                .toISOString()

          })
          .in(
            "id",
            assignedTickets.map(
              ticket => ticket.id
            )
          )
          .eq(
            "order_id",
            order.id
          )
      }

      throw new Error(
        "complimentary_ticket_assignment_conflict"
      )
    }

    /* =========================================
       CREATE ORDER_TICKETS
    ========================================= */

    const orderTicketRows =
      assignedTickets.map(
        ticket => ({

          order_id:
            order.id,

          ticket_id:
            ticket.id

        })
      )

    const {
      error: orderTicketsError
    } =
      await supabase
        .schema("raffles")
        .from("order_tickets")
        .insert(
          orderTicketRows
        )

    if (orderTicketsError) {

      throw orderTicketsError
    }

    /* =========================================
       RECALCULATE COUNTERS
    ========================================= */

    await recalculateRaffleCounters({

      raffle_id

    })

    /* =========================================
       AUDIT
    ========================================= */

       await createAuditLog({

      admin_user_id,

      action:
        "complimentary_tickets_assigned",

      entity_type:
        "order",

      entity_id:
        order.id,

      metadata: {

        raffle_id,

        raffle_title:
          raffle.title,

        raffle_slug:
          raffle.slug,

        buyer_name:
          normalizedName,

        buyer_email:
          normalizedEmail,

        buyer_phone:
          normalizedPhone,

        quantity,

        campaign_name:
          normalizedCampaignName,

        reason:
          normalizedReason,

        ticket_ids:
          assignedTickets.map(
            ticket => ticket.id
          ),

        ticket_codes:
          assignedTickets.map(
            ticket =>
              ticket.ticket_code
          )

      }

    })

    let emailSent =
      false

    try {

      await sendComplimentaryTicketsEmail({

        email:
          normalizedEmail,

        buyerName:
          normalizedName,

        raffleTitle:
          raffle.title,

        tickets:
          assignedTickets,

        campaignName:
          normalizedCampaignName,

        reason:
          normalizedReason

      })

      emailSent =
        true

    } catch (emailError) {

      console.error(
        "complimentary assignment email error",
        emailError
      )
    }

       return {

      raffle,

      order,

      tickets:
        assignedTickets,

      email_sent:
        emailSent

    }

  } catch (error) {

    console.error(
      "assign complimentary tickets error",
      error
    )

    /* =========================================
       ROLLBACK ORDER_TICKETS
    ========================================= */

    await supabase
      .schema("raffles")
      .from("order_tickets")
      .delete()
      .eq(
        "order_id",
        order.id
      )

    /* =========================================
       ROLLBACK INVENTORY
    ========================================= */

    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status:
          "available",

        order_id:
          null,

        payment_id:
          null,

        buyer_email:
          null,

        reserved_until:
          null,

        reservation_token:
          null,

        metadata: {},

        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        "order_id",
        order.id
      )
      .eq(
        "status",
        "complimentary"
      )

    /* =========================================
       DELETE ZERO-VALUE ORDER
    ========================================= */

    await supabase
      .schema("raffles")
      .from("orders")
      .delete()
      .eq(
        "id",
        order.id
      )

    await recalculateRaffleCounters({

      raffle_id

    })

    throw error
  }
}