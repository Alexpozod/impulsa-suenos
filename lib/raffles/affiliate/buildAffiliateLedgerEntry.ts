export function buildAffiliateLedgerEntry({

  raffle_id,

  order_id,

  payment_id,

  affiliate_id,

  affiliate_code,

  commission_amount,

commercial

}:{

  raffle_id:string

  order_id:string

  payment_id:string

  affiliate_id:string

  affiliate_code:string

  commission_amount:number

  commercial?:{

    grossAmount:number

    vatPercent:number

    vatAmount:number

    gatewayPercent:number

    gatewayFee:number

    netCommercialAmount:number

    commissionPercent:number

  }

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

    affiliate_code,

  commercial

}

  }

}