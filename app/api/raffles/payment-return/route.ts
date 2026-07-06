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

    const url =
  new URL(req.url)

const searchParams =
  url.searchParams

console.log(
  "PAYMENT RETURN FULL URL",
  req.url
)

console.log(
  "PAYMENT RETURN SEARCH",
  Object.fromEntries(
    searchParams.entries()
  )
)

      console.log(
  "PAYMENT RETURN URL",
  req.url
)

const token =
  searchParams.get("token")

console.log(
  "PAYMENT RETURN HIT",
  {
    token,
    params:
      Object.fromEntries(
        searchParams.entries()
      )
  }
)

/* =========================
   FLOW RETURN

   Flow normalmente NO envía
   el token en el navegador.

   El webhook ya procesa
   completamente el pago.

   La página /payment/check
   será la encargada de
   consultar el estado.
========================= */

if (!token) {

  console.log(
    "FLOW RETURN WITHOUT TOKEN"
  )

  const flowOrder =
    searchParams.get("flowOrder") ??
    searchParams.get("flow_order") ??
    searchParams.get("order") ??
    searchParams.get("flowOrderNumber")

  console.log(
    "FLOW RETURN ORDER",
    flowOrder
  )

  if (flowOrder) {

    const { data: payment } =
      await supabase
        .schema("raffles")
        .from("payments")
        .select(`
          *,
          orders (*)
        `)
        .contains("metadata", {
          flow_order: Number(flowOrder)
        })
        .maybeSingle()

    console.log(
      "FLOW PAYMENT FOUND",
      payment?.id
    )
  }

  return NextResponse.redirect(
    "https://sorteos.impulsasuenos.com/raffles/payment/check",
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

    "https://sorteos.impulsasuenos.com/raffles/payment/failure",

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

  console.log(
  "PAYMENT RETURN STATUS",
  {
    paymentStatus,
    orderStatus
  }
)

if (
  paymentStatus === "approved" &&
  orderStatus === "paid"
) {

  console.log(
    "REDIRECTING SUCCESS"
  )

  return NextResponse.redirect(

    `https://sorteos.impulsasuenos.com/raffles/payment/success?order=${payment.orders.id}`,

    303

  )

}

if (
  paymentStatus === "pending" &&
  orderStatus !== "cancelled"
) {

  console.log(
    "REDIRECTING PENDING"
  )

  return NextResponse.redirect(

    `https://sorteos.impulsasuenos.com/raffles/payment/check?order=${payment.orders.id}`,

    303

  )

}

console.log(
  "REDIRECTING FAILURE"
)

return NextResponse.redirect(
  "https://sorteos.impulsasuenos.com/raffles/payment/failure",
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

    "https://sorteos.impulsasuenos.com/raffles/payment/check",

    303
  )
}

}

export async function POST(
  req: Request
) {

  return GET(req)
}