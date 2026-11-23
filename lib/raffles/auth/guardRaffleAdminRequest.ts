import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Local guard for Raffles administrative API routes.
 * Never trust the shared middleware: it excludes /api/admin/raffles.
 * Returns a response to send immediately on denial, or null on success.
 */
export async function guardRaffleAdminRequest(req: Request): Promise<NextResponse | null> {
  const match = req.headers.get("authorization")?.match(/^Bearer +([^\s]+)$/i)
  const token = match?.[1]

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    await requireRaffleAdmin({ user_id: user.id, allowed_roles: ["raffle_admin"] })
    return null
  } catch (error) {
    if (error instanceof Error &&
        (error.message === "raffle_admin_required" || error.message === "raffle_admin_forbidden")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    console.error("raffles_admin_authorization_failed")
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
