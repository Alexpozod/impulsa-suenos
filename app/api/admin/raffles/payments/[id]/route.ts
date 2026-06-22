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
  { params }: {
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
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          *,
          orders (
            *
          ),
          raffles (
            *
          )
        `)
        .eq("id", id)
        .single()

    if (error) {

      return NextResponse.json(
        {
          error:
            "payment_not_found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({

      ok: true,

      payment: data

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