import { resolveAffiliateCommission } from "./resolveAffiliateCommission"
import { shouldCreateAffiliateCommission } from "./shouldCreateAffiliateCommission"
import { buildAffiliateLedgerEntry } from "./buildAffiliateLedgerEntry"
import { insertAffiliateLedgerEntry } from "./insertAffiliateLedgerEntry"

export async function processAffiliateCommission({

  payment_id,
  order_id,
  raffle_id,
  amount,

commercial

}:{

  payment_id:string

  order_id:string

  raffle_id:string

  amount:number

  commercial?:{

  grossAmount:number

  vatPercent:number

  vatAmount:number

  gatewayPercent:number

  gatewayNetFee:number

  gatewayVat:number

  gatewayTotalFee:number

  netCommercialAmount:number

}

}){

  try{

    const commission =
      await resolveAffiliateCommission(

        order_id,

        amount

      )

      console.log(
  "AFFILIATE COMMISSION",
  commission
);

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
          .commissionAmount,

      commercial:
        commercial
        ? {

            ...commercial,

            commissionPercent:
              commission!.calculation
                .commissionPercent

          }
        : undefined

      })

    const inserted =
  await insertAffiliateLedgerEntry(
    ledgerEntry
  )

  console.log(
  "LEDGER ENTRY",
  ledgerEntry
);

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