export interface RuleContext {

  raffleId: string

  quantity: number

  subtotal: number

  unitPrice: number

  commercialCode?: string

  affiliateCode?: string

  referralCode?: string

  couponCode?: string

}

export interface RuleResult {

  promotion: {

    applied: boolean

    promotionId?: string

    promotionCode?: string

    promotionName?: string

    bonusQuantity: number

    discount: number

  }

  affiliate: any

  referral: any

  coupon: any

  hasCommercialRule: boolean

  commercialRuleSource?:
    | "promotion"
    | "coupon"
    | "bundle"
    | "affiliate"
    | "referral"
    | "none"

  highestPriority: number

  winningRule?:
    | "promotion"
    | "coupon"
    | "affiliate"
    | "referral"
    | "none"

}