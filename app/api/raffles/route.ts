import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET() {

  try {

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select(`
  id,
  slug,
  title,
  description,
  short_description,
  cover_image,
  ticket_price_clp,
  end_date,
  status
`)
        .eq(
          "status",
          "active"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error: "load_raffles_failed"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      ok: true,
      raffles: data || []
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