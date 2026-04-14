import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function isAdmin(user_id: string) {
  if (!user_id) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    console.error("isAdmin error:", error);
    return false;
  }

  return !!data;
}