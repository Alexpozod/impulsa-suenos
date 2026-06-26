import { NextResponse } from "next/server"

import { processQuote }
from "@/lib/raffles/business/processQuote"

export const runtime = "nodejs"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const quote =
      await processQuote({

        raffleId:
          body.raffle_id,

        quantity:
          Number(body.quantity),

        tracking: {

  commercialCode:
    body.commercialCode,

  source:
    body.source,

  referrer:
    body.referrer,

  utm_source:
    body.utm_source,

  utm_medium:
    body.utm_medium,

  utm_campaign:
    body.utm_campaign,

  utm_content:
    body.utm_content,

  utm_term:
    body.utm_term,

  ip:
    body.ip,

  userAgent:
    body.userAgent

}

      })

    return NextResponse.json(
      quote
    )

  }

  catch(error:any){

    return NextResponse.json(

      {

        error:
          error?.message

      },

      {

        status:400

      }

    )

  }

}