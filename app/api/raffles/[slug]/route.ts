import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      slug: string
    }>
  }
) {

  try {

const params =
  await context.params

    const { data: raffle } =
      await supabase
        .schema("raffles")
        .from("raffles")
        .select("*")
        .eq(
          "slug",
          params.slug
        )
        .eq(
          "status",
          "active"
        )
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

    return NextResponse.json(
      raffle
    )

  } catch (error) {

    console.error(error)

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