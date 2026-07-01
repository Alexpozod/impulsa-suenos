import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(){

try{

const { data,error } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.select(`
*,
raffle_referrals(
id,
code,
owner_email
)
`)
.order(
"created_at",
{
ascending:false
}
)

console.log("ERROR", error)

console.log(
  JSON.stringify(
    data,
    null,
    2
  )
)

if(error){

throw error

}

return NextResponse.json({

requests:
data ?? []

})

}

catch(error){

console.error(
  "AFFILIATE PAYOUTS ERROR"
)

console.error(error)

return NextResponse.json(

{

requests:[],

error:String(error)

},

{

status:500

}

)

}

}