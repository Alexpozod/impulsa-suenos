import type {
  CommercialBreakdown
} from "@/lib/raffles/commercial/types"

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

  commercial?:

CommercialBreakdown

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

  schemaVersion:2,

  createdBy:

    "affiliate_engine",

  createdAt:

    new Date().toISOString(),

  affiliateId:

    affiliate_id,

  affiliateCode:

    affiliate_code,

  orderId:

    order_id,

  paymentId:

    payment_id,

  raffleId:

    raffle_id,

  commissionAmount:

    commission_amount,

  commercial

}

  }

}