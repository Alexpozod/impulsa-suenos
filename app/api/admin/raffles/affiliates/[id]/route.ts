import { NextResponse } from "next/server"

import { getAffiliateDashboard }
from "@/lib/raffles/affiliate/getAffiliateDashboard"

export const runtime = "nodejs"

export async function GET(

  req: Request,

  {
    params
  }: {
    params: {
      id: string
    }
  }

) {

  try {

    const dashboard =
      await getAffiliateDashboard(
        params.id
      )

    return NextResponse.json(
      dashboard
    )

  } catch (error) {

    console.error(
      "affiliate dashboard error",
      error
    )

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