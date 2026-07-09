import { NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const email =
      String(
        body.email || ""
      )
      .trim()
      .toLowerCase()

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      return NextResponse.json(
        {
          error: "invalid_email"
        },
        {
          status: 400
        }
      )

    }

    const ip =
      req.headers.get(
        "x-forwarded-for"
      ) || ""

    const userAgent =
      req.headers.get(
        "user-agent"
      ) || ""

    const { error } =
      await supabase
        .schema("raffles")
        .from("landing_leads")
        .insert({

          email,

          ip_address: ip,

          user_agent: userAgent,

          source: "landing"

        })

    if (error) {

      if (
        error.code === "23505"
      ) {

        return NextResponse.json({

          success: true,

          duplicated: true

        })

      }

      throw error

    }

    return NextResponse.json({

      success: true

    })

  }

  catch (error) {

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