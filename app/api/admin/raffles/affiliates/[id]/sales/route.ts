import { NextResponse } from "next/server";

import { getAffiliateSales }
from "@/lib/raffles/affiliate/getAffiliateSales";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;

    const { searchParams } =
      new URL(req.url);

    const page =
      Number(
        searchParams.get("page") ?? "1"
      );

    const result =
      await getAffiliateSales(
        id,
        page
      );

    return NextResponse.json(
      result
    );

  }

  catch (error) {

    console.error(
      "affiliate sales error",
      error
    );

    return NextResponse.json(

      {
        error: "server_error"
      },

      {
        status: 500
      }

    );

  }

}