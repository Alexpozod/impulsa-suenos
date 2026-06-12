import { NextResponse } from "next/server"

import { canRequestAffiliatePayout }
from "@/lib/raffles/affiliate/canRequestAffiliatePayout"

export const runtime = "nodejs"

export async function POST(

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

    const validation =
      await canRequestAffiliatePayout(
        id
      )

    if(

      !validation.allowed

    ){

      return NextResponse.json(

        validation,

        {

          status:400

        }

      )

    }

    return NextResponse.json({

      success:true,

      wallet:
        validation.wallet

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        success:false,

        error:"server_error"

      },

      {

        status:500

      }

    )

  }

}