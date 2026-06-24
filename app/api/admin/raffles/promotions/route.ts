import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(
req: Request
){

try{

const auth =
await requireAdminAccess(
req
)

if(!auth.authorized){

return NextResponse.json(
{
error:"unauthorized"
},
{
status:401
}
)

}

const {
data,
error
}
=
await supabase
.schema("raffles")
.from("business_rules")
.select("*")
.order(
"priority",
{
ascending:false
}
)

if(error){

throw error

}

return NextResponse.json({

ok:true,

rules:
data || []

})

}

catch(error){

console.error(error)

return NextResponse.json(
{
error:"server_error"
},
{
status:500
}
)

}

}

export async function POST(
  req: Request
) {

  try {

    const auth =
      await requireAdminAccess(req)

    if (!auth.authorized) {

      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )

    }

    const body =
      await req.json()

    const {
      type,
      code,
      name,
      description,

      raffle_id,

      priority,
      stackable,

      value_type,
      value,

      bonus_quantity,

      min_quantity,
      max_quantity,

      starts_at,
      ends_at,

      max_uses,

      metadata
    } = body

    const { data, error } =
      await supabase
        .schema("raffles")
        .from("business_rules")
        .insert({

          type,

          code,

          name,

          description,

          active: true,

          raffle_id:
            raffle_id || null,

          priority:
            priority ?? 0,

          stackable:
            stackable ?? false,

          value_type:
            value_type || null,

          value:
            value ?? null,

          bonus_quantity:
            bonus_quantity ?? 0,

          min_quantity:
            min_quantity ?? 1,

          max_quantity:
            max_quantity ?? null,

          starts_at:
            starts_at || null,

          ends_at:
            ends_at || null,

          max_uses:
            max_uses ?? null,

          used_count: 0,

          metadata:
            metadata || {}

        })

        .select()

        .single()

    if (error) {

      throw error

    }

    return NextResponse.json({

      ok: true,

      rule: data

    })

  }

  catch (error) {

    console.error(error)

    return NextResponse.json(

      {
        error: "server_error"
      },

      {
        status: 500
      }

    )

  }

}