import { NextResponse } from "next/server"

import { calculateQuote }
from "@/lib/raffles/quote/calculateQuote"

export const runtime = "nodejs"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const {

      raffle_id,

      commercialCode

    } = body

    const quantities =

      [1,3,5]

    const packs =

      await Promise.all(

        quantities.map(

          quantity =>

            calculateQuote({

              raffleId:
                raffle_id,

              quantity,

              commercialCode

            })

        )

      )

    return NextResponse.json({

      ok:true,

      packs

    })

  }

  catch(error:any){

    console.error(error)

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