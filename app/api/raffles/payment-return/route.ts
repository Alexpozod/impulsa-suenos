import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request
) {

  try {

    const { searchParams } =
      new URL(req.url)

    const token =
      searchParams.get("token")

    if (!token) {

      return NextResponse.redirect(

        "https://www.impulsasuenos.com/payment/failure",

        303
      )
    }

    const { data: payment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          *,
          orders (*)
        `)
        .eq(
          "provider_payment_id",
          token
        )
        .maybeSingle()

    if (
      !payment ||
      payment.status !== "approved" ||
      payment.orders?.status !== "paid"
    ) {

      return NextResponse.redirect(

        "https://www.impulsasuenos.com/payment/failure",

        303
      )
    }

    return NextResponse.redirect(

      "https://www.impulsasuenos.com/raffles/payment/success",

      303
    )

  } catch (error) {

    console.error(
      "payment-return error",
      error
    )

    return NextResponse.redirect(

      "https://www.impulsasuenos.com/payment/failure",

      303
    )
  }
}

export async function POST(
  req: Request
) {

  return GET(req)
}