import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!

  )

interface CreateAuditLogParams {

  admin_user_id?: string

  action: string

  entity_type?: string

  entity_id?: string

  metadata?: any

}

export async function
createAuditLog({

  admin_user_id,

  action,

  entity_type,

  entity_id,

  metadata = {}

}: CreateAuditLogParams) {

  try {

    await supabase
      .schema("raffles")
      .from("admin_audit_logs")
      .insert({

        admin_user_id,

        action,

        entity_type,

        entity_id,

        metadata

      })

  } catch (error) {

    console.error(
      "create audit log error",
      error
    )

  }

}