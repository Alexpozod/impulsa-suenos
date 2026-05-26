import { NextResponse } from "next/server"

export async function POST() {

  return NextResponse.redirect(
    "https://www.impulsasuenos.com/raffles/payment/success",
    303
  )
}

export async function GET() {

  return NextResponse.redirect(
    "https://www.impulsasuenos.com/raffles/payment/success",
    303
  )
}