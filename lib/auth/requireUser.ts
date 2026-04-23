import { createClient } from "@supabase/supabase-js"

export async function requireUser(req: Request) {

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

  if (error || !user) {
    throw new Error("invalid user")
  }

  return user
}