import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({

  raffle_id:
    z.string().uuid(),

  ticket_code:
    z.string().min(1),

  prize_position:
    z.number().int().min(1),

  prize_title:
    z.string().min(1),

  visibility_mode:
    z.enum([
      "public",
      "hidden"
    ])
    .optional()

})

export async function POST(
  req: Request
) {

  try {

    /* =========================
       AUTH
    ========================= */

    const authHeader =
      req.headers.get(
        "authorization"
      )

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
    } =
      await supabase.auth
        .getUser(token)

    if (
      userError ||
      !user
    ) {

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

      user_id:
        user.id

    })

    /* =========================
       BODY
    ========================= */

    const body =
      await req.json()

    const parsed =
      schema.safeParse(body)

    if (!parsed.success) {

      return NextResponse.json(
        {
          error:
            "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const {

      raffle_id,
      ticket_code,
      prize_position,
      prize_title,
      visibility_mode =
        "public"

    } = parsed.data

    /* =========================
       LOAD TICKET
    ========================= */

    const {
      data: ticket
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select("*")
        .eq(
          "raffle_id",
          raffle_id
        )
        .eq(
          "ticket_code",
          ticket_code
        )
        .maybeSingle()

    if (!ticket) {

      return NextResponse.json(
        {
          error:
            "ticket_not_found"
        },
        {
          status: 404
        }
      )
    }

    if (
      ticket.status !== "paid"
    ) {

      return NextResponse.json(
        {
          error:
            "ticket_not_paid"
        },
        {
          status: 400
        }
      )
    }

    /* =========================
       DUPLICATE CHECK
    ========================= */

    const {
      data: existingResult
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .select("id")
        .eq(
          "ticket_inventory_id",
          ticket.id
        )
        .maybeSingle()

    if (
      existingResult
    ) {

      return NextResponse.json(
        {
          error:
            "winner_already_registered"
        },
        {
          status: 409
        }
      )
    }

    /* =========================
       LOAD ORDER
    ========================= */

    let winner_name =
      null

    let winner_email =
      null

    let winner_phone =
      null

    if (
      ticket.order_id
    ) {

      const {
        data: order
      } =
        await supabase
          .schema("raffles")
          .from("orders")
          .select(`
            buyer_name,
            buyer_email,
            buyer_phone
          `)
          .eq(
            "id",
            ticket.order_id
          )
          .maybeSingle()

      winner_name =
        order?.buyer_name ||
        null

      winner_email =
        order?.buyer_email ||
        null

      winner_phone =
        order?.buyer_phone ||
        null
    }

    /* =========================
       CREATE RESULT
    ========================= */

    const {
      data: result,
      error:
        resultError
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .insert({

          raffle_id,

          ticket_inventory_id:
            ticket.id,

          ticket_code:
            ticket.ticket_code,

          ticket_number:
            String(
              ticket.ticket_number
            ),

          prize_position,

          prize_title,

          winner_name,

          winner_email,

          winner_phone,

          visibility_mode,

          created_by:
            user.id

        })
        .select()
        .single()

    if (
      resultError ||
      !result
    ) {

      console.error(
        resultError
      )

      return NextResponse.json(
        {
          error:
            "result_create_failed"
        },
        {
          status: 500
        }
      )
    }

    /* =========================
       UPDATE TICKET
    ========================= */

    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status:
          "winner"

      })
      .eq(
        "id",
        ticket.id
      )

    return NextResponse.json({

      ok: true,

      result

    })

  } catch (error) {

    console.error(
      "raffle result error",
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