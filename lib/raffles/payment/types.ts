export interface PaymentProcessingContext {

  paymentId: string

  providerToken: string

  provider: string

  orderId?: string

  raffleId?: string

  amount?: number

  buyerEmail?: string

  providerFee?: number

  userId?: string

  ip?: string

  userAgent?: string

  source?: string

  referrer?: string

  utm_source?: string

  utm_medium?: string

  utm_campaign?: string

  utm_content?: string

  utm_term?: string

  metadata?: Record<string, any>

  payment?: any

  order?: any

  raffle?: any

  tickets?: any[]

}

export interface PaymentProcessingResult {

  success: boolean

  status: string

  message?: string

  tickets?: any[]

}