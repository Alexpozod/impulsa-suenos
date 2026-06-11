export function shouldCreateAffiliateCommission(

  commission: any

) {

  if (!commission) {

    return false

  }

  if (!commission.affiliate) {

    return false

  }

  if (!commission.calculation) {

    return false

  }

  if (

    commission.calculation.commissionAmount <= 0

  ) {

    return false

  }

  return true

}