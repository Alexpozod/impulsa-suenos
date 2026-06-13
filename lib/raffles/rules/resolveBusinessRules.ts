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

coupon

}

}