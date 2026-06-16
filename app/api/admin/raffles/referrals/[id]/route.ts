import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(

  req: Request,

  context: {

    params: Promise<{
      id: string
    }>

  }

) {

  try {

    const { id } =
      await context.params

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("referrals")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {

      return NextResponse.json(

        {
          error: error.message
        },

        {
          status: 404
        }

      )

    }

    return NextResponse.json({

      referral: data

    })

  }

  catch (error: any) {

    return NextResponse.json(

      {

        error:
          error?.message ??
          "server_error"

      },

      {

        status: 500

      }

    )

  }

}