import { getAffiliateCommissionContext } from "./getAffiliateCommissionContext"
import { calculateAffiliateCommission } from "./calculateAffiliateCommission"

export async function resolveAffiliateCommission(

  order_id: string,

  amount: number

) {

  const context =
    await getAffiliateCommissionContext(
      order_id
    )

  if (!context) {

    return null

  }

  const calculation =
    calculateAffiliateCommission({

      amount,

      commissionPercent:
        context.affiliate.commissionPercent

    })

  return {

    affiliate:

      context.affiliate,

    tracking:

      context.tracking,

    calculation

  }

}