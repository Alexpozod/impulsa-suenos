import { NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

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

    const authHeader =
      req.headers.get(
        "authorization"
      )

    const token =
      authHeader?.replace(
        "Bearer ",
        ""
      )

    if (!token) {

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

    const {
      data: { user }
    } =
      await supabase.auth
        .getUser(token)

    if (!user) {

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

    const {
      data: adminUser
    } =
      await supabase
        .schema("raffles")
        .from("admin_users")
        .select("id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "active",
          true
        )
        .maybeSingle()

    if (!adminUser) {

      return NextResponse.json(
        {
          error:
            "forbidden"
        },
        {
          status: 403
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