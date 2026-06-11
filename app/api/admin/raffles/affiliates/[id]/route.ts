import { NextResponse } from "next/server"

import { getAffiliateDashboard }
from "@/lib/raffles/affiliate/getAffiliateDashboard"

export const runtime = "nodejs"

export async function GET(

  req: Request,

  context: {

    params: Promise<{

      id: string

    }>

  }

) {

  try {

    const {

      id

    } = await context.params

    const dashboard =
      await getAffiliateDashboard(
        id
      )

    return NextResponse.json(
      dashboard
    )

  }

  catch (error) {

    console.error(

      "affiliate dashboard error",

      error

    )

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