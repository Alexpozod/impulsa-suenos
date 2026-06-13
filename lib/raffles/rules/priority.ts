export const COMMERCIAL_PRIORITY = {

  coupon: 100,

  promotion: 80,

  bundle: 70,

  affiliate: 60,

  referral: 50,

  default: 0

} as const

export type CommercialRuleType =
  keyof typeof COMMERCIAL_PRIORITY

export function compareCommercialPriority(

  a: CommercialRuleType,

  b: CommercialRuleType

){

  return (

    COMMERCIAL_PRIORITY[a] -

    COMMERCIAL_PRIORITY[b]

  )

}