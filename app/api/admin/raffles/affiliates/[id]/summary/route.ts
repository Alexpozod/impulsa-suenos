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
.select("amount_clp")
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

if(error){

throw error

}

const totalCommission =
(data||[]).reduce(

(sum,item)=>

sum+
Math.abs(
Number(
item.amount_clp||0
)
),

0

)

return NextResponse.json({

totalCommission,

transactions:
data?.length||0

})

}

catch(error){

console.error(error)

return NextResponse.json(

{

totalCommission:0,

transactions:0

},

{

status:500

}

)

}

}