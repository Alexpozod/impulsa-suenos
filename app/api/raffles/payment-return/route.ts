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

    /* =========================
       NO TOKEN
    ========================= */

    if (!token) {

      return NextResponse.redirect(

        "https://www.impulsasuenos.com/raffles/payment/success",

        303
      )
    }

    /* =========================
       LOAD PAYMENT
    ========================= */

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

    /* =========================
       PAYMENT NOT FOUND
    ========================= */

    if (!payment) {

      return NextResponse.redirect(

        "https://www.impulsasuenos.com/raffles/payment/success",

        303
      )
    }

    /* =========================
   STATUS REDIRECT
========================= */

const paymentStatus =
  payment.status

const orderStatus =
  payment.orders?.status

if (
  paymentStatus === "approved" &&
  orderStatus === "paid"
) {

  return NextResponse.redirect(
    "https://www.impulsasuenos.com/raffles/payment/success",
    303
  )
}

if (
  paymentStatus === "pending" ||
  orderStatus === "pending"
) {

  return NextResponse.redirect(
    "https://www.impulsasuenos.com/raffles/payment/pending",
    303
  )
}

return NextResponse.redirect(
  "https://www.impulsasuenos.com/raffles/payment/failure",
  303
)

  } catch (error) {

    console.error(
      "payment-return error",
      error
    )

    /* =========================
       FALLBACK REDIRECT
    ========================= */

    return NextResponse.redirect(

      "https://www.impulsasuenos.com/raffles/payment/success",

      303
    )
  }
}

export async function POST(
  req: Request
) {

  return GET(req)
}