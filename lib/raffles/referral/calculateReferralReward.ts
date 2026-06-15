export interface ReferralRewardInput {

  amount: number

  rewardType?:
    "ticket" |
    "amount" |
    "percentage"

  rewardValue?: number

}

export interface ReferralRewardResult {

  grossAmount: number

  rewardType: string

  rewardValue: number

  rewardAmount: number

}

export function calculateReferralReward(

  input: ReferralRewardInput

): ReferralRewardResult {

  const grossAmount =
    Number(input.amount)

  const rewardType =
    input.rewardType ??
    "percentage"

  const rewardValue =
    Number(
      input.rewardValue ?? 5
    )

  let rewardAmount = 0

  if (

    rewardType ===
    "percentage"

  ) {

    rewardAmount =
      Math.round(

        grossAmount *

        rewardValue /

        100

      )

  }

  else if (

    rewardType ===
    "amount"

  ) {

    rewardAmount =
      rewardValue

  }

  else {

    rewardAmount = 0

  }

  return {

    grossAmount,

    rewardType,

    rewardValue,

    rewardAmount

  }

}