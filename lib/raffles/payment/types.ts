export interface PaymentProcessingContext {

  paymentId: string

  providerToken: string

  provider: string

}

export interface PaymentProcessingResult {

  success: boolean

  status: string

  message?: string

}