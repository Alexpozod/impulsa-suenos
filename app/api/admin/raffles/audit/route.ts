import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

export const runtime = "nodejs"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!

  )

export async function GET(
  req: Request
) {

  try {

    /* =========================
   AUTH
========================= */

const auth =
  await requireAdminAccess(
    req
  )

if (!auth.authorized) {

  return NextResponse.json(
    {
      error:
        "unauthorized"
    },
    {
      status: 401
    }
  )

}

    /* =========================
       LOAD LOGS
    ========================= */

    const {
      data: logs
    } =
      await supabase
        .schema("raffles")
        .from("admin_audit_logs")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(100)

    return NextResponse.json({

      ok: true,

      logs:
        logs || []

    })

  } catch (error) {

    console.error(
      "audit logs api error",
      error
    )

    return NextResponse.json(
      {
        error:
          "server_error"
      },
      {
        status: 500
      }
    )
  }
}