import { resolveAffiliateCommission } from "./resolveAffiliateCommission"
import { shouldCreateAffiliateCommission } from "./shouldCreateAffiliateCommission"
import { buildAffiliateLedgerEntry } from "./buildAffiliateLedgerEntry"
import { insertAffiliateLedgerEntry } from "./insertAffiliateLedgerEntry"

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

    const inserted =
  await insertAffiliateLedgerEntry(
    ledgerEntry
  )

console.log(

  "AFFILIATE_COMMISSION_RESULT",

  {

    payment_id,

    order_id,

    raffle_id,

    inserted:

      inserted.inserted,

    reason:

      inserted.reason ?? null

  }

)

return {

  processed:

    inserted.inserted,

  ledgerEntry,

  result:

    inserted

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