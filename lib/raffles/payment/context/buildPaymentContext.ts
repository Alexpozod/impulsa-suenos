import { PaymentProcessingContext } from "../types"

export async function buildPaymentContext(

  context: PaymentProcessingContext

): Promise<PaymentProcessingContext> {

  /*
    Este builder irá absorbiendo toda la
    carga de información necesaria para
    el pipeline.

    Por ahora simplemente normaliza el
    contexto y prepara los objetos que
    luego serán cargados desde BD.
  */

  return {

    ...context,

    payment:
      context.payment ?? null,

    order:
      context.order ?? null,

    raffle:
      context.raffle ?? null

  }

}