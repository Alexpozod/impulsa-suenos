import { NextResponse } from "next/server"

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

    const authHeader =
      req.headers.get(
        "authorization"
      )

    if (!authHeader) {

      return NextResponse.json(
        [],
        { status: 401 }
      )
    }

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      )

    const {
      data: { user }
    } =
      await supabase
        .auth
        .getUser(token)

    if (!user?.email) {

      return NextResponse.json(
        [],
        { status: 401 }
      )
    }

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("tickets")
        .select(`
          *,
          raffles (
            id,
            title,
            slug,
            cover_image,
            status
          )
        `)
        .eq(
          "user_email",
          user.email
        )
        .order(
          "created_at",
          { ascending: false }
        )

    if (error) {

      console.error(error)

      return NextResponse.json([])
    }

    return NextResponse.json(
      data || []
    )

  } catch (error) {

    console.error(error)

    return NextResponse.json([])
  }
}