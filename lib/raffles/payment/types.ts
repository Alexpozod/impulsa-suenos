export interface PaymentProcessingContext {

  paymentId: string

  providerToken: string

  provider: string

  orderId?: string

  raffleId?: string

  amount?: number

  buyerEmail?: string

  providerFee?: number

  metadata?: Record<string, any>

}

export interface PaymentProcessingResult {

  success: boolean

  status: string

  message?: string

}