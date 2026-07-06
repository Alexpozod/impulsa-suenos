import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  req: Request
) {

  try {

    const { searchParams } =
      new URL(req.url)

    const orderId =
      searchParams.get("order_id")

    if (!orderId) {

      return NextResponse.json(
        {
          error:
            "missing_order_id"
        },
        {
          status: 400
        }
      )
    }

    const { data: order } =
      await supabase
        .schema("raffles")
        .from("orders")
        .select(`
          id,
          status,
          payments (
            status
          )
        `)
        .eq(
          "id",
          orderId
        )
        .maybeSingle()

    if (!order) {

      return NextResponse.json(
        {
          error:
            "order_not_found"
        },
        {
          status: 404
        }
      )
    }

    const { data: payment } =
  await supabase
    .schema("raffles")
    .from("payments")
    .select("status")
    .eq("order_id", orderId)
    .order("created_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle()

return NextResponse.json({

  order_status:
    order.status,

  payment_status:
    payment?.status ?? "pending"

})


  } catch (error) {

    console.error(
      "order-status error",
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