import { NextRequest, NextResponse }
from "next/server"

import { createClient }
from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function GET(

req: NextRequest,

context:{
params:Promise<{
raffleId:string
}>
}

){

try{

const {
raffleId
}
=
await context.params

const {

data:plan

}
=
await supabase
.schema("raffles")
.from("financial_plans")
.select("*")
.eq(
"raffle_id",
raffleId
)
.maybeSingle()

if(!plan){

return NextResponse.json({

exists:false

})

}

const {

data:payments

}
=
await supabase
.schema("raffles")
.from("payments")
.select(`
amount_clp
`)
.eq(
"raffle_id",
raffleId
)
.eq(
"status",
"approved"
)

const {

data:tickets

}
=
await supabase
.schema("raffles")
.from("ticket_inventory")
.select("id")
.eq(
"raffle_id",
raffleId
)
.eq(
"status",
"paid"
)

const revenue =
(payments||[])
.reduce(

(sum:any,row:any)=>

sum+
Number(
row.amount_clp||0
),

0

)

const soldTickets =
tickets?.length || 0

const progress =
plan.required_revenue > 0

?

(
revenue /
plan.required_revenue
) * 100

:

0

const marketingCost =
revenue *
(
Number(plan.marketing_percent || 0)
/
100
)

const influencerCost =
revenue *
(
Number(plan.influencer_percent || 0)
/
100
)

const flowCost =
revenue *
(
Number(plan.flow_percent || 0)
/
100
)

const ivaCost =
revenue *
(
Number(plan.iva_percent || 0)
/
100
)

const projectedProfit =

revenue

-

Number(plan.prize_cost || 0)

-

Number(plan.fixed_costs || 0)

-

marketingCost

-

influencerCost

-

flowCost

-

ivaCost

const remainingRevenue =

Math.max(

0,

Number(
plan.required_revenue || 0
)

-

revenue

)

const remainingTickets =

Math.max(

0,

Number(
plan.minimum_tickets || 0
)

-

soldTickets

)

const surplusRevenue =

Math.max(

0,

revenue

-

Number(
plan.required_revenue || 0
)

)

const availableCash =

Math.max(

0,

projectedProfit

)

const extraPrizeCapacity =

Math.max(

0,

surplusRevenue * 0.80

)

return NextResponse.json({

exists:true,

revenue,

soldTickets,

progress,

projectedProfit,

requiredRevenue:
plan.required_revenue,

minimumTickets:
plan.minimum_tickets,

breakEvenTickets:
plan.break_even_tickets,

remainingRevenue,

remainingTickets,

surplusRevenue,

availableCash,

extraPrizeCapacity

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