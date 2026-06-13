import { COMMERCIAL_PRIORITY } from "./priority"

import { applyPromotions } from "../promotion/applyPromotions"

import { resolveAffiliate } from "../affiliate/resolveAffiliate"

import { resolveReferral } from "../referral/resolveReferral"

import { RuleContext, RuleResult } from "./types"

import { resolveCoupon } from "../coupon/resolveCoupon"

export async function resolveBusinessRules(

context: RuleContext

): Promise<RuleResult>{

const promotion=

await applyPromotions({

raffleId:
context.raffleId,

quantity:
context.quantity,

subtotal:
context.subtotal,

unitPrice:
context.unitPrice

})

const affiliate=

await resolveAffiliate(

context.affiliateCode

)

const referral =
await resolveReferral(
context.referralCode
)

const coupon =
await resolveCoupon(
context.couponCode,
context.subtotal
)

const hasCommercialRule =

promotion.applied ||

coupon?.found ||

affiliate?.found ||

referral?.found

let highestPriority = 0

if (

coupon?.found

){

highestPriority =

COMMERCIAL_PRIORITY.coupon

}

else if(

promotion.applied

){

highestPriority =

COMMERCIAL_PRIORITY.promotion

}

else if(

affiliate?.found

){

highestPriority =

COMMERCIAL_PRIORITY.affiliate

}

else if(

referral?.found

){

highestPriority =

COMMERCIAL_PRIORITY.referral

}

let commercialRuleSource:
"promotion"
|"coupon"
|"bundle"
|"affiliate"
|"none"
=
"none"

if (promotion.applied) {

commercialRuleSource="promotion"

}

else if (coupon?.found) {

commercialRuleSource="coupon"

}

else if (affiliate?.found) {

commercialRuleSource="affiliate"

}

return{

promotion:{

applied:
promotion.applied,

promotionId:
promotion.promotionId,

promotionCode:
promotion.promotionCode,

promotionName:
promotion.promotionName,

bonusQuantity:
promotion.bonusQuantity,

discount:
promotion.discount

},

affiliate,

referral,

coupon,

hasCommercialRule,

commercialRuleSource,

highestPriority

}

}