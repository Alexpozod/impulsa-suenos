// app/api/withdraw/route.ts

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Endpoint deprecated. Use /api/payout/request"
    },
    { status: 410 }
  )
}