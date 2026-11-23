import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRaffleAdmin } from "@/lib/raffles/auth/requireRaffleAdmin"
import { projectAffiliatePayoutRequest } from "@/lib/raffles/affiliate/createAffiliatePayoutRequest"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(req: Request){

try{

  const token = req.headers.get("authorization")?.match(/^Bearer +([^\s]+)$/i)?.[1]
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    await requireRaffleAdmin({ user_id: user.id })
  } catch (error) {
    if (error instanceof Error &&
        (error.message === "raffle_admin_required" || error.message === "raffle_admin_forbidden")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    throw error
  }

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

if(error){

throw error

}

const requests =
(data ?? []).map((request)=>{

const affiliate =
(affiliates ?? []).find(
(a)=>
a.id === request.affiliate_id
)

return{

...projectAffiliatePayoutRequest(request),

affiliate

}

})

return NextResponse.json({

requests

})

}

catch {

console.error(
  "AFFILIATE PAYOUTS ERROR"
)

return NextResponse.json(

{

requests:[],

error:"server_error"

},

{

status:500

}

)

}

}
