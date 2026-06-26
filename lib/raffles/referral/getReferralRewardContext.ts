import {
  loadReferralFromOrder
} from "./loadReferralFromOrder"

import {
  findReferralByCode
} from "./findReferralByCode"

export async function getReferralRewardContext(

  order_id: string

){

  const tracking =

    await loadReferralFromOrder(
      order_id
    )

  if(!tracking){

    return null

  }

  if(!tracking.commercialCode){

    return null

}

  const referral =

    await findReferralByCode(
      tracking.commercialCode
    )

  if(!referral){

    return null

  }

  return{

    tracking,

    referral

  }

}