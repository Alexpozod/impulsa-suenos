export interface PromotionContext {

  raffleId: string

  quantity: number

  subtotal: number

  unitPrice: number

}

export interface PromotionResult {

  applied: boolean

  promotionId?: string

  promotionCode?: string

  promotionName?: string

  bonusQuantity: number

  discount: number

}