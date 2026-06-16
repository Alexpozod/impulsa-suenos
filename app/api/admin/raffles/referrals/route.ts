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
      .from("referrals")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      )

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

  (
    process.env.NEXT_PUBLIC_APP_URL ||

    process.env.NEXT_PUBLIC_SITE_URL ||

    "https://impulsasuenos.com"

  ).replace(/\/$/, "")

  const referrals =
    (data ?? []).map(
      (item: any) => ({

        ...item,

        shareCode:
          item.code,

        shareUrl:
          `${baseUrl}/raffles?ref=${item.code}`

      })
    )

  return NextResponse.json({

    referrals

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

      reward_type,

      reward_value

    } = body

    const normalizedCode =
      String(code)
        .trim()
        .toUpperCase()

    const normalizedEmail =
      String(owner_email)
        .trim()
        .toLowerCase()

    const rewardValue =
      Number(reward_value)

    if (

      !normalizedCode ||

      !normalizedEmail ||

      Number.isNaN(
        rewardValue
      )

    ) {

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

    const { data: existing } =
      await supabase
        .schema("raffles")
        .from("referrals")
        .select("id")
        .or(

          `code.eq.${normalizedCode},owner_email.eq.${normalizedEmail}`

        )
        .maybeSingle()

    if (existing) {

      return NextResponse.json(

        {

          error:
            "referral_exists"

        },

        {

          status: 409

        }

      )

    }

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("referrals")
        .insert({

          code:
            normalizedCode,

          owner_email:
            normalizedEmail,

          reward_type:
            reward_type ??
            "percentage",

          reward_value:
            rewardValue,

          active:
            true

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

      referral:
        data

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