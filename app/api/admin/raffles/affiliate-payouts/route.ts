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

const { data, error } =
await supabase
.schema("raffles")
.from("affiliate_payout_requests")
.select("*")
.order(
"created_at",
{
ascending:false
}
)

const { data: affiliates } =
await supabase
.schema("raffles")
.from("raffle_referrals")
.select(`
id,
code,
owner_email
`)

console.log(data)
console.log(error)

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

const requests =
(data ?? []).map((request:any)=>{

const affiliate =
(affiliates ?? []).find(
(a:any)=>
a.id === request.affiliate_id
)

return{

...request,

affiliate

}

})

return NextResponse.json({

requests

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