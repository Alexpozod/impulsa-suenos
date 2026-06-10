export interface QuoteInput {

  raffleId: string

  quantity: number

  userId?: string | null

  affiliateCode?: string | null

  referralCode?: string | null

  couponCode?: string | null

  source?: string | null

  referrer?: string | null

  utm_source?: string | null

  utm_medium?: string | null

  utm_campaign?: string | null

  utm_content?: string | null

  utm_term?: string | null

  ip?: string | null

  userAgent?: string | null

}

export interface QuotePromotion {

  id?: string

  code?: string

  name?: string

  type?: string

  value?: number
}

export interface QuoteAffiliate {

  id?: string

  code?: string

  name?: string

  commissionType?: "percentage" | "fixed"

  commissionValue?: number

  commissionAmount?: number

}

export interface QuoteReferral {

  id?: string

  code?: string

  rewardType?: string

  rewardValue?: number
}

export interface QuoteCoupon {

  id?: string

  code?: string

  discountType?: string

  discountValue?: number
}

export interface QuoteResult {

  raffleId: string

  requestedQuantity: number

  bonusQuantity: number

  finalQuantity: number

  unitPrice: number

  subtotal: number

  discount: number

  total: number

  currency: string

  promotion?: QuotePromotion | null

  affiliate?: QuoteAffiliate | null

  referral?: QuoteReferral | null

  coupon?: QuoteCoupon | null

  metadata?: Record<string, any>
}