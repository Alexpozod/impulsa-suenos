import { createClient } from "@supabase/supabase-js"

export async function requireAdmin(req: Request) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    throw new Error("unauthorized")
  }

  const token = authHeader.replace("Bearer ", "")

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user?.email) {
    throw new Error("invalid user")
  }

  const user_email = user.email.toLowerCase()

  /* 🔐 VALIDAR ADMIN REAL EN DB */
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", user_email)
    .maybeSingle()

  if (!profile || profile.role !== "admin") {
    throw new Error("forbidden")
  }

  return { user, user_email }
}