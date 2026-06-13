export interface RuleContext {

  raffleId: string

  quantity: number

  subtotal: number

  unitPrice: number

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

}