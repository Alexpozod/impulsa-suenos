import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(

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

    const body =
      await req.json()

    const {

      code,

      owner_email,

      commission_percent,

      bonus_quantity_1,

      bonus_quantity_3,

      bonus_quantity_5,

      active

    } = body

    const {

      data,

      error

    } =
      await supabase
        .schema("raffles")
        .from("raffle_referrals")
        .update({

          code:
            String(code)
              .trim()
              .toUpperCase(),

          owner_email:
            String(owner_email)
              .trim()
              .toLowerCase(),

          commission_percent:
            Number(commission_percent),

          bonus_quantity_1:
            Number(bonus_quantity_1),

          bonus_quantity_3:
            Number(bonus_quantity_3),

          bonus_quantity_5:
            Number(bonus_quantity_5),

          active:
            Boolean(active)

        })

        .eq("id", id)

        .select()

        .single()

    if (error) {

      return NextResponse.json(

        {

          error:
            error.message

        },

        {

          status:500

        }

      )

    }

    return NextResponse.json({

      success:true,

      affiliate:data

    })

  }

  catch(error:any){

    return NextResponse.json(

      {

        error:

          error?.message ??

          "server_error"

      },

      {

        status:500

      }

    )

  }

}