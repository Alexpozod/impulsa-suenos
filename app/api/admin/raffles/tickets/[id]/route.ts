import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request,
  {
    params
  }: {
    params: Promise<{
      id: string
    }>
  }
) {

  try {

    const authHeader =
      req.headers.get(
        "authorization"
      )

    const token =
      authHeader?.replace(
        "Bearer ",
        ""
      )

    if (!token) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
      )
    }

    const {
      data: { user }
    } =
      await supabase.auth
        .getUser(token)

    if (!user) {

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
      user_id: user.id
    })

    const { id } =
      await params

    const {
      data: ticket,
      error
    } =
      await supabase
        .schema("raffles")
        .from("ticket_inventory")
        .select(`
          *,
          raffles (
            id,
            title,
            slug,
            status
          )
        `)
        .eq(
          "id",
          id
        )
        .single()

    if (error || !ticket) {

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

    let order = null

    if (ticket.order_id) {

      const {
        data
      } =
        await supabase
          .schema("raffles")
          .from("orders")
          .select("*")
          .eq(
            "id",
            ticket.order_id
          )
          .single()

      order = data
    }

    let payment = null

    if (ticket.payment_id) {

      const {
        data
      } =
        await supabase
          .schema("raffles")
          .from("payments")
          .select(`
            id,
            provider,
            provider_payment_id,
            amount_clp,
            status,
            created_at
          `)
          .eq(
            "id",
            ticket.payment_id
          )
          .single()

      payment = data
    }

    return NextResponse.json({

      ok: true,

      ticket,

      order,

      payment

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "server_error"
      },
      {
        status: 500
      }
    )
  }
}