import { PaymentProcessingContext } from "../types"

import { processRafflePayment }
from "@/lib/raffles/ledger/processRafflePayment"

export async function createLedger(
  context: PaymentProcessingContext
) {

  /*
    Próximamente este step será el único
    encargado del Ledger.

    Por ahora solamente dejamos el punto
    centralizado para migrar el webhook.
  */

  return context

}