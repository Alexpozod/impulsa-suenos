import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logToDB(level: string, message: string, data?: any) {
  try {
    await supabase.from("system_logs").insert({
      level,
      message,
      data,
    });
  } catch (err) {
    console.error("Error guardando log", err);
  }
}

export async function logErrorToDB(message: string, error: any) {
  try {
    await supabase.from("error_logs").insert({
      message,
      error,
    });
  } catch (err) {
    console.error("Error guardando error", err);
  }
}