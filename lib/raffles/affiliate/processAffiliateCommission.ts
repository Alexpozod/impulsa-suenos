import { resolveAffiliateCommission } from "./resolveAffiliateCommission"
import { shouldCreateAffiliateCommission } from "./shouldCreateAffiliateCommission"
import { buildAffiliateLedgerEntry } from "./buildAffiliateLedgerEntry"

export async function processAffiliateCommission({

  payment_id,
  order_id,
  raffle_id,
  amount

}:{

  payment_id:string

  order_id:string

  raffle_id:string

  amount:number

}){

  try{

    const commission =
      await resolveAffiliateCommission(

        order_id,

        amount

      )

    if(

      !shouldCreateAffiliateCommission(
        commission
      )

    ){

      return{

        processed:false,

        reason:"no_commission"

      }

    }

    const ledgerEntry =
      buildAffiliateLedgerEntry({

        raffle_id,

        order_id,

        payment_id,

        affiliate_id:
          commission!.affiliate.id,

        affiliate_code:
          commission!.affiliate.code,

        commission_amount:
          commission!.calculation
            .commissionAmount

      })

    return{

      processed:true,

      ledgerEntry

    }

  }

  catch(error){

    console.error(

      "processAffiliateCommission",

      error

    )

    return{

      processed:false,

      reason:"error"

    }

  }

}