import {
  getReferralRewardContext
} from "./getReferralRewardContext"

import {
  calculateReferralReward
} from "./calculateReferralReward"

export async function resolveReferralReward(

  order_id: string,

  amount: number

){

  const context =

    await getReferralRewardContext(
      order_id
    )

  if(!context){

    return null

  }

  const calculation =

  calculateReferralReward({

    amount,

    rewardType:

      context.referral
        .rewardType,

    rewardValue:

      context.referral
        .rewardValue

  })

  return{

    referral:

      context.referral,

    tracking:

      context.tracking,

    calculation

  }

}