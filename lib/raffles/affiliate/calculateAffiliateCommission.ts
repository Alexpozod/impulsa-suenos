export interface AffiliateCommissionInput {

  amount: number

  commissionPercent: number

}

export interface AffiliateCommissionResult {

  grossAmount: number

  commissionPercent: number

  commissionAmount: number

}

export function calculateAffiliateCommission(

  input: AffiliateCommissionInput

): AffiliateCommissionResult {

  const grossAmount =
    Number(input.amount)

  const commissionPercent =
    Number(input.commissionPercent)

  const commissionAmount =
    Math.round(

      grossAmount *

      commissionPercent /

      100

    )

  return {

    grossAmount,

    commissionPercent,

    commissionAmount

  }

}