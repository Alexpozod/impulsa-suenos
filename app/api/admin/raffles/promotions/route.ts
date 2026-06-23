import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { requireAdminAccess }
from "@/lib/raffles/admin/requireAdminAccess"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(
req: Request
){

try{

const auth =
await requireAdminAccess(
req
)

if(!auth.authorized){

return NextResponse.json(
{
error:"unauthorized"
},
{
status:401
}
)

}

const {
data,
error
}
=
await supabase
.schema("raffles")
.from("business_rules")
.select("*")
.order(
"priority",
{
ascending:false
}
)

if(error){

throw error

}

return NextResponse.json({

ok:true,

rules:
data || []

})

}

catch(error){

console.error(error)

return NextResponse.json(
{
error:"server_error"
},
{
status:500
}
)

}

}