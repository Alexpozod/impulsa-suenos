import crypto from "crypto"

import * as XLSX from "xlsx"

import { NextResponse }
from "next/server"

import { z }
from "zod"

import { createClient }
from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

const schema = z.object({

  raffle_id:
    z.string().uuid()

})

export async function POST(
  req: Request
) {

  try {

    /* =========================================
       RAFFLE ADMIN AUTH
    ========================================= */

    const user_id =
      req.headers.get("x-user-id")

    if (!user_id) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    await requireRaffleAdmin({

      user_id,

      allowed_roles: [
        "raffle_admin"
      ]
    })

    /* =========================================
       BODY
    ========================================= */

    const body =
      await req.json()

    const parsed =
      schema.safeParse(body)

    if (!parsed.success) {

      return NextResponse.json(
        {
          error: "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const {
      raffle_id
    } = parsed.data

    /* =========================================
       LOAD RAFFLE
    ========================================= */

    const { data: raffle } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select(`
          id,
          title,
          slug,
          status,
          end_date
        `)
        .eq("id", raffle_id)
        .maybeSingle()

    if (!raffle) {

      return NextResponse.json(
        {
          error:
            "raffle_not_found"
        },
        {
          status: 404
        }
      )
    }

    if (raffle.status !== "ended") {

      return NextResponse.json(
        {
          error:
            "raffle_not_ended"
        },
        {
          status: 400
        }
      )
    }

    /* =========================================
       LOAD VALID TICKETS
    ========================================= */

    const { data: tickets, error } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          id,
          ticket_code,
          ticket_number,
          buyer_email,
          created_at,
          order_id,
          payment_id
        `)
        .eq("raffle_id", raffle_id)
        .eq("status", "paid")
        .order(
          "ticket_number",
          {
            ascending: true
          }
        )

    if (error) {

      console.error(
        "export excel tickets error",
        error
      )

      return NextResponse.json(
        {
          error:
            "tickets_load_failed"
        },
        {
          status: 500
        }
      )
    }

    /* =========================================
       EXPORT HASH
    ========================================= */

    const exportPayload = {

      raffle_id,

      exported_at:
        new Date().toISOString(),

      tickets

    }

    const exportHash =
      crypto
        .createHash("sha256")
        .update(
          JSON.stringify(
            exportPayload
          )
        )
        .digest("hex")

    /* =========================================
       EXCEL ROWS
    ========================================= */

    const rows = (tickets || [])
      .map(ticket => ({

        ticket_code:
          ticket.ticket_code,

        internal_ticket_number:
          ticket.ticket_number,

        buyer_email:
          ticket.buyer_email,

        order_id:
          ticket.order_id,

        payment_id:
          ticket.payment_id,

        created_at:
          ticket.created_at

      }))

    /* =========================================
       WORKBOOK
    ========================================= */

    const workbook =
      XLSX.utils.book_new()

    /* =========================================
       METADATA SHEET
    ========================================= */

    const metadataSheet =
      XLSX.utils.json_to_sheet([{

        raffle_title:
          raffle.title,

        raffle_slug:
          raffle.slug,

        raffle_status:
          raffle.status,

        raffle_end_date:
          raffle.end_date,

        exported_at:
          new Date().toISOString(),

        export_hash:
          exportHash,

        valid_tickets:
          tickets?.length || 0

      }])

    XLSX.utils.book_append_sheet(
      workbook,
      metadataSheet,
      "metadata"
    )

    /* =========================================
       TICKETS SHEET
    ========================================= */

    const ticketsSheet =
      XLSX.utils.json_to_sheet(
        rows
      )

    XLSX.utils.book_append_sheet(
      workbook,
      ticketsSheet,
      "tickets"
    )

    /* =========================================
       GENERATE BUFFER
    ========================================= */

    const buffer =
      XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType: "xlsx"
        }
      )

    /* =========================================
       RESPONSE
    ========================================= */

    return new Response(buffer, {

      status: 200,

      headers: {

        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          `attachment; filename="${raffle.slug}-official-export.xlsx"`

      }

    })

  } catch (error) {

    console.error(
      "export excel error",
      error
    )

    return NextResponse.json(
      {
        error:
          "server_error"
      },
      {
        status: 500
      }
    )
  }
}