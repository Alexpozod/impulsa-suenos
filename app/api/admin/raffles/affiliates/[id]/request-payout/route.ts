import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import {
  calculateAffiliateWallet
} from "@/lib/raffles/affiliate/calculateAffiliateWallet"

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

const wallet =
await calculateAffiliateWallet(
id
)

if(
wallet.available<=0
){

return NextResponse.json({

success:false,

error:"no_available_balance"

})

}

console.log(

"AFFILIATE_PAYOUT_REQUEST",

{

affiliateId:id,

generated:
wallet.generated,

available:
wallet.available,

paid:
wallet.paid,

pending:
wallet.pending

}

)

const { data:existing } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.select("id")
.eq(
"affiliate_id",
id
)
.eq(
"status",
"pending"
)
.maybeSingle()

if(existing){

console.log(

"AFFILIATE_PENDING_REQUEST",

{

affiliateId:id,

requestId:
existing.id

}

)

}

if(existing){

return NextResponse.json({

success:false,

error:"pending_request_exists",

requestId:
existing.id

})

}

const {

data,

error

} =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.insert({

affiliate_id:id,

amount_clp:
wallet.available,

status:"pending",

metadata:{

requestedAt:
new Date().toISOString(),

generated:
wallet.generated,

available:
wallet.available,

paid:
wallet.paid

}

})
.select()
.single()

if(error){

throw error

}

return NextResponse.json({

success:true,

request:data

})

}

catch(error){

console.error(error)

return NextResponse.json({

success:false,

error:"server_error"

})

}

}