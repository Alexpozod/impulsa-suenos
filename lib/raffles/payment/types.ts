export interface PaymentProcessingContext {

  paymentId: string

  providerToken: string

  provider: string

  orderId?: string

  raffleId?: string

  amount?: number

}

export interface PaymentProcessingResult {

  success: boolean

  status: string

  message?: string

}