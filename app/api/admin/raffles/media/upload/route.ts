import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireRaffleAdmin }
from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function POST(
  req: Request
) {

  try {

    const authHeader =
      req.headers.get(
        "authorization"
      )

    if (!authHeader) {

      return NextResponse.json(
        {
          error: "unauthorized"
        },
        {
          status: 401
        }
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
      await supabase.auth
        .getUser(token)

    if (!user) {

      return NextResponse.json(
        {
          error: "invalid_user"
        },
        {
          status: 401
        }
      )
    }

    await requireRaffleAdmin({

      user_id:
        user.id

    })

    const formData =
      await req.formData()

    const file =
      formData.get(
        "file"
      ) as File

    if (!file) {

      return NextResponse.json(
        {
          error: "file_required"
        },
        {
          status: 400
        }
      )
    }

    const bytes =
      await file.arrayBuffer()

    const buffer =
      Buffer.from(bytes)

    const extension =
      file.name
        .split(".")
        .pop()

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`

    const path =
      `raffles/${fileName}`

    const {
      error
    } =
      await supabase.storage
        .from(
          "raffle-media"
        )
        .upload(
          path,
          buffer,
          {
            contentType:
              file.type
          }
        )

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error:
            "upload_failed"
        },
        {
          status: 500
        }
      )
    }

    const {
      data
    } =
      supabase.storage
        .from(
          "raffle-media"
        )
        .getPublicUrl(
          path
        )

    return NextResponse.json({

      ok: true,

      url:
        data.publicUrl,

      type:
        file.type.startsWith(
          "video/"
        )
          ? "video"
          : "image"

    })

  } catch (error) {

    console.error(error)

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