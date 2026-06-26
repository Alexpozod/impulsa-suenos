export type CommercialType =
  | "affiliate"
  | "coupon"
  | "referral"
  | "promotion"
  | "none"

export interface CommercialInput {

  raffleId: string

  quantity: number

  subtotal: number

  unitPrice: number

  commercialCode?: string

}

export interface CommercialResolution {

  found: boolean

  type: CommercialType

  code?: string

  id?: string

  name?: string

  metadata?: Record<string, any>

  bonusQuantity: number

  discountAmount: number

  commissionAmount: number

  commissionPercent: number

}