import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function isUserBlocked(user_email: string) {

  const { data } = await supabase
    .from("fraud_blocks")
    .select("*")
    .eq("user_email", user_email)
    .eq("active", true)
    .maybeSingle()

  return !!data
}