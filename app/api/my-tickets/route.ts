import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: Request) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No auth" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = user.email

  const { data: tickets, error: ticketError } = await supabase
    .from("tickets")
    .select(`
      *,
      campaigns(title)
    `)
    .eq("user_email", email)
    .order("created_at", { ascending: false })

  if (ticketError) {
    return NextResponse.json({ error: "Error fetching tickets" }, { status: 500 })
  }

  return NextResponse.json({ tickets })
}