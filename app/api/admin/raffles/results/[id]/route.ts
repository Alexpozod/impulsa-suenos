import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const patchSchema = z.object({

  visibility_mode:
    z.enum([
      "public",
      "hidden"
    ])
    .optional(),

  delivery_status:
    z.string()
    .optional(),

  delivery_notes:
    z.string()
    .optional(),

  evidence_images:
    z.array(
      z.string()
    )
    .optional(),

  evidence_videos:
    z.array(
      z.string()
    )
    .optional()

})

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
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

    const body =
      await req.json()

    const parsed =
      patchSchema.safeParse(
        body
      )

    if (!parsed.success) {

      return NextResponse.json(
        {
          error:
            "invalid_input"
        },
        {
          status: 400
        }
      )
    }

    const { id } =
      await context.params

    const {
      data,
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .update(
          parsed.data
        )
        .eq("id", id)
        .select()
        .single()

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error:
            "update_failed"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true,

      result: data

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

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string
    }>
  }
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

    const { id } =
      await context.params

    const {
      data: result
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .select("*")
        .eq("id", id)
        .single()

    if (!result) {

      return NextResponse.json(
        {
          error:
            "result_not_found"
        },
        {
          status: 404
        }
      )
    }

    await supabase
      .schema("raffles")
      .from("ticket_inventory")
      .update({

        status: "paid"

      })
      .eq(
        "id",
        result.ticket_inventory_id
      )

    const {
      error
    } =
      await supabase
        .schema("raffles")
        .from("raffle_results")
        .delete()
        .eq("id", id)

    if (error) {

      console.error(error)

      return NextResponse.json(
        {
          error:
            "delete_failed"
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({

      ok: true

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