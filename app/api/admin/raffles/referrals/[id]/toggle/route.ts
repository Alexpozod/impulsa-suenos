import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function POST(

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

    const { data } =
      await supabase
        .schema("raffles")
        .from("referrals")
        .select("active")
        .eq("id",id)
        .single()

    if(!data){

      return NextResponse.json({

        success:false

      })

    }

    await supabase
      .schema("raffles")
      .from("referrals")
      .update({

        active:!data.active

      })
      .eq("id",id)

    return NextResponse.json({

      success:true

    })

  }

  catch(error){

    console.error(error)

    return NextResponse.json({

      success:false

    })

  }

}