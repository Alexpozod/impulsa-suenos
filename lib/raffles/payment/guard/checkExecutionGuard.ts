import { createClient } from "@supabase/supabase-js"

import {
  ExecutionGuardContext,
  ExecutionGuardResult
} from "./types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkExecutionGuard(
  context: ExecutionGuardContext
): Promise<ExecutionGuardResult> {

  const { data } =
    await supabase
      .schema("raffles")
      .from("payments")
      .select("status")
      .eq(
        "id",
        context.executionKey.split(":")[1]
      )
      .maybeSingle()

  if (!data) {

    return {

      allowed: true

    }

  }

  if (
    data.status === "approved"
  ) {

    return {

      allowed: false,

      reason:
        "already_processed"

    }

  }

  if (
    data.status === "processing"
  ) {

    return {

      allowed: false,

      reason:
        "already_processing"

    }

  }

  return {

    allowed: true

  }

}