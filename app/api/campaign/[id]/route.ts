import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    received_id: params?.id,
    type: typeof params?.id,
    length: params?.id?.length
  })
}