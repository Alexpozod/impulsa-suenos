import { calculateAffiliateWallet }
from "./calculateAffiliateWallet"

export async function canRequestAffiliatePayout(

  affiliateId: string,

  minimumAmount = 10000

){

  const wallet =
    await calculateAffiliateWallet(
      affiliateId
    )

  if (

    wallet.available < minimumAmount

  ){

    return{

      allowed:false,

      reason:"minimum_not_reached",

      wallet

    }

  }

  return{

    allowed:true,

    reason:null,

    wallet

  }

}