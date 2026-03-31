import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Disabled: use MercadoPago checkout flow" },
    { status: 410 }
  )
}
