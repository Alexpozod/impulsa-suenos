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

  if (!tracking.affiliateCode) {

    return null

  }

  const affiliate =
    await findAffiliateByCode(
      tracking.affiliateCode
    )

  if (!affiliate) {

    return null

  }

  return {

    tracking,

    affiliate

  }

}