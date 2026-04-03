import { NextResponse } from "next/server"
import { sendAlert } from "@/lib/alerts/sendAlert"

export async function GET() {
  await sendAlert({
    title: "TEST ALERT",
    message: "Sistema de alertas funcionando",
  })

  return NextResponse.json({ ok: true })
}