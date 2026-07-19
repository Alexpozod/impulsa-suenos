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

function buildRedirectUrl(
  req: Request,
  path: string
) {

  return new URL(
    path,
    req.url
  )

}

async function processPaymentReturn({

  req,
  token,
  params

}: {

  req: Request
  token: string | null
  params: Record<string, string>

}) {

  console.log(
    "PAYMENT RETURN FULL URL",
    req.url
  )

  console.log(
    "PAYMENT RETURN METHOD",
    req.method
  )

  console.log(
    "PAYMENT RETURN PARAMS",
    params
  )

  console.log(
    "PAYMENT RETURN HIT",
    {
      token,
      params
    }
  )

  /* =========================================
     RETURN WITHOUT TOKEN
  ========================================= */

  if (!token) {

    console.log(
      "FLOW RETURN WITHOUT TOKEN"
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

  /* =========================================
     LOAD PAYMENT
  ========================================= */

  const {
    data: payment,
    error: paymentError
  } =
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

  if (paymentError) {

    console.error(
      "PAYMENT RETURN LOAD ERROR",
      paymentError
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

  /* =========================================
     PAYMENT NOT FOUND
  ========================================= */

  if (!payment) {

    console.log(
      "PAYMENT RETURN PAYMENT NOT FOUND",
      {
        token
      }
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

  const order =
    Array.isArray(payment.orders)
      ? payment.orders[0]
      : payment.orders

  if (!order?.id) {

    console.error(
      "PAYMENT RETURN ORDER NOT FOUND",
      {
        paymentId:
          payment.id,

        token
      }
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

  const paymentStatus =
    payment.status

  const orderStatus =
    order.status

  console.log(
    "PAYMENT RETURN STATUS",
    {
      paymentId:
        payment.id,

      orderId:
        order.id,

      paymentStatus,

      orderStatus
    }
  )

  /* =========================================
     SUCCESS
  ========================================= */

  if (
    paymentStatus === "approved" &&
    orderStatus === "paid"
  ) {

    console.log(
      "REDIRECTING SUCCESS"
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        `/raffles/payment/success?order=${encodeURIComponent(
          order.id
        )}`
      ),

      303

    )

  }

  /* =========================================
     FAILED
  ========================================= */

  if (
    paymentStatus === "failed" ||
    paymentStatus === "rejected" ||
    paymentStatus === "cancelled" ||
    orderStatus === "cancelled"
  ) {

    console.log(
      "REDIRECTING FAILURE"
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        `/raffles/payment/failure?order=${encodeURIComponent(
          order.id
        )}`
      ),

      303

    )

  }

  /* =========================================
     PENDING / WEBHOOK STILL PROCESSING
  ========================================= */

  console.log(
    "REDIRECTING CHECK"
  )

  return NextResponse.redirect(

    buildRedirectUrl(
      req,
      `/raffles/payment/check?order=${encodeURIComponent(
        order.id
      )}`
    ),

    303

  )

}

/* =========================================
   GET RETURN
========================================= */

export async function GET(
  req: Request
) {

  try {

    const url =
      new URL(req.url)

    const params =
      Object.fromEntries(
        url.searchParams.entries()
      )

    const token =
      url.searchParams.get(
        "token"
      )

    return await processPaymentReturn({

      req,
      token,
      params

    })

  } catch (error) {

    console.error(
      "PAYMENT RETURN GET ERROR",
      error
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

}

/* =========================================
   POST RETURN FROM FLOW
========================================= */

export async function POST(
  req: Request
) {

  try {

    const contentType =
      req.headers.get(
        "content-type"
      ) || ""

    let params:
      Record<string, string> = {}

    if (
      contentType.includes(
        "application/x-www-form-urlencoded"
      ) ||
      contentType.includes(
        "multipart/form-data"
      )
    ) {

      const formData =
        await req.formData()

      params =
        Object.fromEntries(

          Array
            .from(
              formData.entries()
            )
            .map(
              ([key, value]) => [

                key,

                typeof value === "string"
                  ? value
                  : value.name

              ]
            )

        )

    } else {

      const body =
        await req.text()

      params =
        Object.fromEntries(

          new URLSearchParams(
            body
          ).entries()

        )

    }

    const token =
      params.token || null

    console.log(
      "PAYMENT RETURN POST BODY",
      params
    )

    return await processPaymentReturn({

      req,
      token,
      params

    })

  } catch (error) {

    console.error(
      "PAYMENT RETURN POST ERROR",
      error
    )

    return NextResponse.redirect(

      buildRedirectUrl(
        req,
        "/raffles/payment/check"
      ),

      303

    )

  }

}