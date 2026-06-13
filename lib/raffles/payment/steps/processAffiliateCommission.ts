import { PaymentProcessingContext } from "../types"

import {
  processAffiliateCommission as processAffiliateCommissionEngine
}
from "@/lib/raffles/affiliate/processAffiliateCommission"

export async function processAffiliateCommission(

  context: PaymentProcessingContext

) {

  /*
    Este step será el único encargado
    de ejecutar el motor de afiliados.

    La migración desde webhook se hará
    progresivamente.
  */

  return context

}