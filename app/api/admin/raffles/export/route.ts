import crypto from "crypto"

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

    const authHeader =
  req.headers.get("authorization")

if (!authHeader) {

  return NextResponse.json(
    {
      error: "unauthorized"
    },
    {
      status: 401
    }
  )
}

const token =
  authHeader.replace(
    "Bearer ",
    ""
  )

const {
  data: { user },
  error: userError
} = await supabase.auth.getUser(
  token
)

if (userError || !user) {

  return NextResponse.json(
    {
      error: "invalid_user"
    },
    {
      status: 401
    }
  )
}

await requireRaffleAdmin({

  user_id: user.id,

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
          created_at,
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

    /* =========================================
       VALIDATE STATE
    ========================================= */

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
        "export tickets error",
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
       LOAD PARTICIPANT ORDERS
    ========================================= */

    const {
      data: participantOrdersData,
      error: participantOrdersError
    } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          id,
          buyer_name,
          buyer_email,
          buyer_phone,
          student_debt_amount_clp
        `)
        .eq("raffle_id", raffle_id)
        .limit(5000)

    if (participantOrdersError) {

      console.error(
        "export participant orders error",
        participantOrdersError
      )

      return NextResponse.json(
        {
          error:
            "participant_orders_load_failed"
        },
        {
          status: 500
        }
      )
    }

    const participantOrders =
      participantOrdersData || []

    const participantOrderMap =
      new Map(
        participantOrders.map(
          order => [
            order.id,
            order
          ]
        )
      )

    const enrichedTickets =
      (tickets || []).map(
        ticket => {

          const order =
            participantOrderMap.get(
              ticket.order_id
            )

          const declaredDebt =
            order
              ?.student_debt_amount_clp ==
            null
              ? null
              : Number(
                  order
                    .student_debt_amount_clp
                )

          const maximumPayable =
            declaredDebt == null
              ? null
              : Math.min(
                  declaredDebt,
                  5000000
                )

          return {

            ...ticket,

            buyer_name:
              order?.buyer_name ??
              null,

            buyer_email:
              order?.buyer_email ??
              ticket.buyer_email ??
              null,

            buyer_phone:
              order?.buyer_phone ??
              null,

            student_debt_amount_clp:
              declaredDebt,

            maximum_payable_clp:
              maximumPayable

          }

        }
      )

    /* =========================================
       EXPORT SNAPSHOT
    ========================================= */

    const exportPayload = {

      exported_at:
        new Date().toISOString(),

      raffle: {

        id:
          raffle.id,

        title:
          raffle.title,

        slug:
          raffle.slug,

        status:
          raffle.status,

        end_date:
          raffle.end_date

      },

      totals: {

        valid_tickets:
          tickets?.length || 0

      },

            tickets:
        enrichedTickets

    }

    /* =========================================
       GENERATE HASH
    ========================================= */

    const exportHash =
      crypto
        .createHash("sha256")
        .update(
          JSON.stringify(
            exportPayload
          )
        )
        .digest("hex")

    return NextResponse.json({

      ok: true,

      export_hash:
        exportHash,

      export:
        exportPayload

    })

  } catch (error) {

    console.error(
      "raffle export error",
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