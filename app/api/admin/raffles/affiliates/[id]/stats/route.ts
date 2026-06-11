import { NextResponse } from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
createClient(

process.env
.NEXT_PUBLIC_SUPABASE_URL!,

process.env
.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(

req: Request,

context:{

params:Promise<{

id:string

}>

}

){

try{

const { id } =
await context.params

const { data,error } =
await supabase
.schema("raffles")
.from("ledger")
.select("amount_clp,created_at")
.eq(
"type",
"affiliate_commission"
)
.contains(
"metadata",
{
affiliateId:id
}
)
.order(
"created_at",
{
ascending:false
}
)

if(error){

throw error

}

const transactions =
data || []

const totalCommission =
transactions.reduce(

(sum,item)=>

sum+

Math.abs(
Number(
item.amount_clp||0
)
),

0

)

const lastTransaction =

transactions.length>0

?

transactions[0].created_at

:

null

return NextResponse.json({

transactions:

transactions.length,

totalCommission,

lastTransaction

})

}

catch(error){

console.error(error)

return NextResponse.json(

{

transactions:0,

totalCommission:0,

lastTransaction:null

},

{

status:500

}

)

}

}