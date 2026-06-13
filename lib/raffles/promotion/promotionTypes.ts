export interface PromotionContext {

  raffleId: string

  quantity: number

  subtotal: number

  unitPrice: number

  couponCode?: string

  affiliateCode?: string

  referralCode?: string

}

export interface PromotionResult {

  applied: boolean

  promotionId?: string

  promotionCode?: string

  promotionName?: string

  bonusQuantity: number

  discount: number

}