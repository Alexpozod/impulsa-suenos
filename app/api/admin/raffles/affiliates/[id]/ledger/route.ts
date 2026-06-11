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

context: {

params: Promise<{

id: string

}>

}

){

try{

const { id } =
await context.params

const { data, error } =
await supabase
.schema("raffles")
.from("ledger")
.select("*")
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

return NextResponse.json({

ledger:
data || []

})

}

catch(error){

console.error(error)

return NextResponse.json(

{

ledger:[]

},

{

status:500

}

)

}

}