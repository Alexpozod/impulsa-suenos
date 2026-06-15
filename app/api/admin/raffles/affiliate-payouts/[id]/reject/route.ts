import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function POST(

req:Request,

context:{

params:Promise<{

id:string

}>

}

){

try{

const { id } =
await context.params

const { data:request,error } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.select("*")
.eq(
"id",
id
)
.maybeSingle()

if(

error ||

!request

){

return NextResponse.json({

success:false,

error:"request_not_found"

},

{

status:404

})

}

if(

request.status!=="pending"

){

return NextResponse.json({

success:true,

message:"already_processed"

})

}

const { error:updateError } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.update({

status:"rejected",

processed_at:
new Date().toISOString()

})
.eq(
"id",
id
)

if(updateError){

throw updateError

}

return NextResponse.json({

success:true

})

}

catch(error){

console.error(error)

return NextResponse.json(

{

success:false,

error:"server_error"

},

{

status:500

}

)

}

}