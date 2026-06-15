import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

    const { data, error } =
    await supabase
      .schema("raffles")
      .from("raffle_referrals")
      .select("*")
      .order("created_at", {
        ascending: false
      })

  if (error) {

    return NextResponse.json(

      {
        error: error.message
      },

      {
        status: 500
      }

    )

  }

  const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"

const { data: raffles } =
  await supabase
    .schema("raffles")
    .from("raffles")
    .select("id,title,slug")
    .eq("status","active")

const affiliates =
  (data ?? []).map((item:any)=>({

    ...item,

    shareCode:
      item.code,

    shareUrl:
      `${baseUrl}?aff=${item.code}`,

    raffleLinks:

      (raffles ?? []).map((raffle:any)=>({

        id:
          raffle.id,

        title:
          raffle.title,

        slug:
          raffle.slug,

        url:
          `${baseUrl}/raffles/${raffle.slug}?aff=${item.code}`

      }))

  }))

return NextResponse.json({

  affiliates

})

}

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {

      code,
      owner_email,
      commission_percent

    } = body

    if (
      !code ||
      !owner_email
    ) {

      return NextResponse.json(

        {
          error:
            "missing_fields"
        },

        {
          status: 400
        }

      )

    }

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .insert({

          code:
            String(code)
              .trim()
              .toUpperCase(),

          owner_email:
            String(owner_email)
              .trim()
              .toLowerCase(),

          commission_percent:
            Number(
              commission_percent
            ) || 0,

          active: true

        })
        .select()
        .single()

    if (error) {

      return NextResponse.json(

        {
          error:
            error.message
        },

        {
          status: 500
        }

      )

    }

    return NextResponse.json({

      success: true,

      affiliate:
        data

    })

  }

  catch (error: any) {

    return NextResponse.json(

      {

        error:

          error?.message ||

          "server_error"

      },

      {

        status: 500

      }

    )

  }

}