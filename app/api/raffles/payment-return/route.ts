import { NextResponse } from "next/server"

export async function POST() {

  return NextResponse.redirect(
    new URL(
      "/raffles/payment/success",
      process.env.NEXT_PUBLIC_APP_URL
    )
  )
}

export async function GET() {

  return NextResponse.redirect(
    new URL(
      "/raffles/payment/success",
      process.env.NEXT_PUBLIC_APP_URL
    )
  )
}