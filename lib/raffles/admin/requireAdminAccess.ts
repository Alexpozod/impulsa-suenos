import { createClient }
from "@supabase/supabase-js"

const supabase =
  createClient(

    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,

    process.env
      .SUPABASE_SERVICE_ROLE_KEY!

  )

export async function
requireAdminAccess(
  req: Request
) {

  try {

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

      return {

        authorized: false

      }

    }

    const {
      data: { user }
    } =
      await supabase.auth
        .getUser(token)

    if (!user) {

      return {

        authorized: false

      }

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

      return {

        authorized: false

      }

    }

    return {

      authorized: true,

      user,

      adminUser

    }

  } catch (error) {

    console.error(
      "require admin access error",
      error
    )

    return {

      authorized: false

    }

  }

}