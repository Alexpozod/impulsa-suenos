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

return NextResponse.json({

success:false,

error:"pending_request_exists"

})

}

const { error } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.insert({

affiliate_id:id,

amount_clp:
wallet.available,

status:"pending"

})

if(error){

throw error

}

return NextResponse.json({

success:true

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