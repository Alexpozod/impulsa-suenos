import { createClient }
from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RequireRaffleAdminParams {
  user_id: string
  allowed_roles?: string[]
}

export async function requireRaffleAdmin({

  user_id,
  allowed_roles = [
    "raffle_admin"
  ]

}: RequireRaffleAdminParams) {

  const { data, error } =
    await supabase
      .schema("raffles")
      .from("admin_users")
      .select("*")
      .eq("user_id", user_id)
      .eq("active", true)
      .maybeSingle()

  if (error || !data) {

    throw new Error(
      "raffle_admin_required"
    )
  }

  if (
    !allowed_roles.includes(
      data.role
    )
  ) {

    throw new Error(
      "raffle_admin_forbidden"
    )
  }

  return data
}