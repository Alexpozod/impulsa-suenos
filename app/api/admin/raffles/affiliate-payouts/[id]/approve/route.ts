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

const { data:request,error:requestError } =
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

requestError ||

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

const { data:existing } =
await supabase
.schema("raffles")
.from("ledger")
.select("id")
.eq(
"type",
"affiliate_payout"
)
.contains(

"metadata",

{

requestId:id

}

)
.maybeSingle()

if(!existing){

const { error:ledgerError } =
await supabase
.schema("raffles")
.from("ledger")
.insert({

type:"affiliate_payout",

flow_type:"out",

status:"confirmed",

amount_clp:
-Math.abs(
Number(
request.amount_clp
)
),

metadata:{

affiliateId:
request.affiliate_id,

requestId:id

}

})

if(

ledgerError

){

throw ledgerError

}

}

const { error:updateError } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.update({

status:"paid",

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