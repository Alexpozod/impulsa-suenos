import { createClient } from "@supabase/supabase-js"
import { QuoteInput, QuoteResult } from "./types"

import { resolveBusinessRules } from "../rules/resolveBusinessRules"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function calculateQuote(
  input: QuoteInput
): Promise<QuoteResult> {

  const {

    raffleId,
    quantity

  } = input

  if (quantity <= 0) {
    throw new Error("invalid_quantity")
  }

  const { data: raffle, error } =
    await supabase
      .schema("raffles")
      .from("raffles")
      .select("*")
      .eq("id", raffleId)
      .single()

  if (error || !raffle) {
    throw new Error("raffle_not_found")
  }

  if (raffle.status !== "active") {
    throw new Error("raffle_inactive")
  }

  const unitPrice =
    Number(
      raffle.ticket_price_clp
    )

  if (!unitPrice || unitPrice <= 0) {
    throw new Error("invalid_ticket_price")
  }
  
  const subtotal =
unitPrice * quantity

const commercialCode =
  input.commercialCode ?? undefined

const rules =
await resolveBusinessRules({

  raffleId,

  quantity,

  subtotal,

  unitPrice,

  commercialCode

})

const bonusQuantity =

Math.max(

  rules.promotion.bonusQuantity,

  rules.coupon?.bonusQuantity ?? 0,

  rules.affiliate?.found
    ? (
        input.quantity === 1
          ? (rules.affiliate.bonusQuantity1 ?? 0)
        : input.quantity === 3
          ? (rules.affiliate.bonusQuantity3 ?? 0)
        : input.quantity === 5
          ? (rules.affiliate.bonusQuantity5 ?? 0)
        : 0
      )
    : 0

)

const promotionDiscount =
rules.promotion.discount

const couponDiscount =
rules.coupon?.discountAmount ?? 0

const discount =
promotionDiscount + couponDiscount

  const total =
    subtotal - discount

  return {

    raffleId,

    requestedQuantity:
      quantity,

    bonusQuantity,

    finalQuantity:
      quantity + bonusQuantity,

    unitPrice,

    subtotal,

    discount,

    total,

    currency:
      raffle.currency || "CLP",

    promotion:{

id:
rules.promotion.promotionId,

code:
rules.promotion.promotionCode,

name:
rules.promotion.promotionName,

type:
rules.promotion.bonusQuantity > 0
? "bonus"
: "discount",

value:
rules.promotion.bonusQuantity > 0
? rules.promotion.bonusQuantity
: rules.promotion.discount

},

  affiliate:

rules.affiliate?.found
?{

code:
rules.affiliate.affiliateCode,

name:
rules.affiliate.affiliateName,

commissionType:
rules.affiliate.commissionType,

commissionValue:
rules.affiliate.commissionValue,

commissionAmount:
rules.affiliate.commissionAmount

}

:null,

   referral:

rules.referral?.found
?{

code:
rules.referral.referralCode,

rewardType:
rules.referral.rewardType,

rewardValue:
rules.referral.rewardValue

}

:null,

    coupon:

rules.coupon?.found
?{

id:
rules.coupon.id,

code:
rules.coupon.code,

discountType:
rules.coupon.discountType,

discountValue:
rules.coupon.discountValue

}

:null,

    metadata: {

  engine: 1,

  calculatedAt:
    new Date().toISOString(),

  commercialType:

    rules.winningRule,

  commercialRuleSource:

    rules.commercialRuleSource



}

  }

}