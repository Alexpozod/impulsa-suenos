export function buildAffiliateLedgerEntry({

  raffle_id,

  order_id,

  payment_id,

  affiliate_id,

  affiliate_code,

  commission_amount

}:{

  raffle_id:string

  order_id:string

  payment_id:string

  affiliate_id:string

  affiliate_code:string

  commission_amount:number

}){

  return{

    raffle_id,

    order_id,

    payment_id,

    type:"affiliate_commission",

    flow_type:"out",

    amount_clp:-commission_amount,

    status:"confirmed",

    metadata:{

      affiliateId:

        affiliate_id,

      affiliateCode:

        affiliate_code

    }

  }

}