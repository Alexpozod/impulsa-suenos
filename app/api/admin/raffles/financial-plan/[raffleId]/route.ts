import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(

req: Request,

context: {
params: Promise<{
raffleId: string
}>
}

) {

try {

const { raffleId } =
await context.params

const { data, error } =
await supabase
.schema("raffles")
.from("raffle_financial_plans")
.select("*")
.eq(
"raffle_id",
raffleId
)
.maybeSingle()

if (error) {

throw error

}

return NextResponse.json({

plan: data ?? null

})

}

catch (error) {

console.error(error)

return NextResponse.json(

{
plan: null
},

{
status: 500
}

)

}

}

export async function POST(

req: Request,

context: {
params: Promise<{
raffleId: string
}>
}

) {

try {

const { raffleId } =
await context.params

const body =
await req.json()

const { error } =
await supabase
.schema("raffles")
.from("raffle_financial_plans")
.upsert({

raffle_id:
raffleId,

prize_cost:
body.prize_cost,

fixed_costs:
body.fixed_costs,

marketing_percent:
body.marketing_percent,

influencer_percent:
body.influencer_percent,

flow_percent:
body.flow_percent,

iva_percent:
body.iva_percent,

target_profit:
body.target_profit,

ticket_price:
body.ticket_price,

required_revenue:
body.required_revenue,

minimum_tickets:
body.minimum_tickets,

break_even_tickets:
body.break_even_tickets,

updated_at:
new Date().toISOString()

},
{
onConflict:
"raffle_id"
}
)

if (error) {

throw error

}

return NextResponse.json({

success: true

})

}

catch (error) {

console.error(error)

return NextResponse.json(

{
success: false
},

{
status: 500
}

)

}

}