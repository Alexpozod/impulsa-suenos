import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!

  )

interface CheckRateLimitParams {

  key: string

  route: string

  limit?: number

  windowMinutes?: number

}

export async function
checkRateLimit({

  key,

  route,

  limit = 20,

  windowMinutes = 1

}: CheckRateLimitParams) {

  const windowStart =
    new Date(

      Date.now() -
      windowMinutes *
      60 *
      1000

    ).toISOString()

  const {
    data: existing
  } =
    await supabase
      .schema("raffles")
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .eq("route", route)
      .gte(
        "window_start",
        windowStart
      )
      .maybeSingle()

  /* =========================
     FIRST HIT
  ========================= */

  if (!existing) {

    await supabase
      .schema("raffles")
      .from("rate_limits")
      .insert({

        key,

        route,

        hits: 1,

        window_start:
          new Date().toISOString()

      })

    return {

      allowed: true,

      remaining:
        limit - 1

    }

  }

  /* =========================
     LIMIT REACHED
  ========================= */

  if (
    existing.hits >= limit
  ) {

    return {

      allowed: false,

      remaining: 0

    }

  }

  /* =========================
     UPDATE HITS
  ========================= */

  await supabase
    .schema("raffles")
    .from("rate_limits")
    .update({

      hits:
        existing.hits + 1,

      updated_at:
        new Date().toISOString()

    })
    .eq("id", existing.id)

  return {

    allowed: true,

    remaining:
      limit -
      (existing.hits + 1)

  }

}