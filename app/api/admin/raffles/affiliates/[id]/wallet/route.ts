import { NextResponse } from "next/server"

import { calculateAffiliateWallet }
from "@/lib/raffles/affiliate/calculateAffiliateWallet"

export const runtime = "nodejs"

export async function GET(

  req: Request,

  context: {

    params: Promise<{

      id: string

    }>

  }

){

  try{

    const { id } =
      await context.params

    const wallet =
      await calculateAffiliateWallet(
        id
      )

    return NextResponse.json({

      wallet

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        wallet:{

          generated:0,

          available:0,

          paid:0,

          pending:0

        }

      },

      {

        status:500

      }

    )

  }

}