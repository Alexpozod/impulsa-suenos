import { createClient } from "@supabase/supabase-js"
import { QuoteInput, QuoteResult } from "./types"

import { applyPromotions } from "../promotion/applyPromotions"
import { resolveAffiliate } from "../affiliate/resolveAffiliate"
import { resolveReferral } from "../referral/resolveReferral"

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

const promotion =
await applyPromotions({

raffleId,

quantity,

subtotal,

unitPrice

})

const affiliate =
await resolveAffiliate(

input.affiliateCode

)

const referral =
await resolveReferral(

input.referralCode

)

const bonusQuantity =
promotion.bonusQuantity

const discount =
promotion.discount

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
promotion.promotionId,

code:
promotion.promotionCode,

name:
promotion.promotionName,

type:
promotion.bonusQuantity>0
?"bonus"
:"discount",

value:
promotion.bonusQuantity>0
?promotion.bonusQuantity
:promotion.discount

},

  affiliate:
affiliate.found
  ? {
      code: affiliate.affiliateCode,
      name: affiliate.affiliateName,
      commissionType: affiliate.commissionType,
      commissionValue: affiliate.commissionValue,
      commissionAmount: affiliate.commissionAmount
    }
  : null,

   referral:
referral.found
  ? {
      code: referral.referralCode,
      rewardType: referral.rewardType,
      rewardValue: referral.rewardValue
    }
  : null,

    coupon: null,

    metadata: {

      engine: 1,

      calculatedAt:
        new Date().toISOString()

    }

  }

}