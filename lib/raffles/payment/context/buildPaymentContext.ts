import { PaymentProcessingContext } from "../types"

export async function buildPaymentContext(
  context: PaymentProcessingContext
): Promise<PaymentProcessingContext> {

  /*
    Aquí se irán enriqueciendo los datos
    provenientes del webhook.

    Por ahora simplemente retornamos
    el contexto recibido.
  */

  return context

}