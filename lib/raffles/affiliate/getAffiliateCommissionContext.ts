import { loadAffiliateFromOrder } from "./loadAffiliateFromOrder"
import { findAffiliateByCode } from "./findAffiliateByCode"

export async function getAffiliateCommissionContext(
  order_id: string
) {

  const tracking =
    await loadAffiliateFromOrder(
      order_id
    )

  if (!tracking) {

    return null

  }

  /*
  =====================================

  Nuevo motor comercial.

  Si existe commercialCode siempre tiene
  prioridad.

  Compatibilidad con órdenes antiguas.

  =====================================
  */

  const code =
  tracking.commercialCode

  if (!code) {

    return null

  }

  const affiliate =
    await findAffiliateByCode(
      code
    )

  if (!affiliate) {

    return null

  }

  return {

    tracking,

    affiliate

  }

}