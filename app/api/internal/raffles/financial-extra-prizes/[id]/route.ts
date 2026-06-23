import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(

  req: Request,

  context: {
    params: Promise<{
      id:string
    }>
  }

){

  try{

    const { id } =
      await context.params

    await supabase
      .schema("raffles")
      .from("financial_extra_prizes")
      .delete()
      .eq(
        "id",
        id
      )

    return NextResponse.json({

      ok:true

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json(

      {

        error:
          "server_error"

      },

      {

        status:500

      }

    )

  }

}