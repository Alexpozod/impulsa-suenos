import { createClient } from "@supabase/supabase-js"

import {
PromotionContext,
PromotionResult
} from "./promotionTypes"

const supabase =
createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.SUPABASE_SERVICE_ROLE_KEY!

)

export async function applyPromotions(

context: PromotionContext

): Promise<PromotionResult> {

try{

const now =
new Date().toISOString()

const {
data:rules
}
=
await supabase
.schema("raffles")
.from("business_rules")
.select("*")
.eq("active",true)
.in(
"type",
[
"bundle"
]
)

if(!rules?.length){

return {

applied:false,

bonusQuantity:0,

discount:0

}

}

let selectedBundle:any =
null

let selectedBonus:any =
null

for(
const rule of rules
){

if(
rule.starts_at &&
rule.starts_at > now
){
continue
}

if(
rule.ends_at &&
rule.ends_at < now
){
continue
}

if(
rule.min_quantity &&
context.quantity <
rule.min_quantity
){
continue
}

if(
rule.max_quantity &&
context.quantity >
rule.max_quantity
){
continue
}

if(rule.type === "bundle"){

if(
!selectedBundle ||
rule.priority >
selectedBundle.priority
){

selectedBundle = rule

}

}

if(rule.type === "bonus"){

if(
!selectedBonus ||
rule.priority >
selectedBonus.priority
){

selectedBonus = rule

}

}

}

let selectedRule:any = null

if(
selectedBundle &&
selectedBonus
){

selectedRule =

selectedBundle.priority >=
selectedBonus.priority

? selectedBundle

: selectedBonus

}

else{

selectedRule =
selectedBundle ||
selectedBonus

}

const totalBonus =
Number(
selectedRule?.bonus_quantity || 0
)

return {

applied:
totalBonus > 0,

promotionId:
selectedRule?.id,

promotionCode:
selectedRule?.code,

promotionName:
selectedRule?.name,

bonusQuantity:
totalBonus,

discount:0

}

}

catch(error){

console.error(
"applyPromotions error",
error
)

return {

applied:false,

bonusQuantity:0,

discount:0

}

}

}